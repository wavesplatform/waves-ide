import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
import { action, observable } from 'mobx';
import styles from '@src/layout/styles.less';
import { IImportedData } from '@stores/SettingsStore';


export const oldUrl = window.origin.includes('localhost') ? 'http://localhost:8081' : 'https://ide.wavesplatform.com';
export const newUrl = window.origin.includes('localhost') ? 'http://localhost:8080' : 'https://waves-ide.com';
export const isOldUrl = oldUrl.includes(window.origin);
export const isNewUrl = newUrl.includes(window.origin);
const origins = [oldUrl, newUrl];
const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

class MigrationStore extends SubStore {
    private parentBus: Bus | null = null;
    private iframeBus: Bus | null = null;
    @observable public loading = false;
    @observable public success = false;

    constructor(rootStore: RootStore) {
        super(rootStore);
        isNewUrl && this.initFrame();
    }

    // ============== PARENT ==============
    @action private initParent = async () => {
        const init = (adapter: WindowAdapter) => {
            this.parentBus = new Bus(adapter);
            this.parentBus.once('migration-success', () => {
                this.success = true;
            });
            console.log('1 init parent');
            return null;
        };


        if (isSafari) {
            const win = this.openIde();
            if (!win) {
                throw 'the window is not open';
            }
            WindowAdapter.createSimpleWindowAdapter(win, {origins}).then(init);
        } else {
            const iframe = document.createElement('iframe');
            WindowAdapter.createSimpleWindowAdapter(iframe, {origins}).then(init);
            iframe.src = newUrl;
            iframe.className = styles.iframe;
            document.body.appendChild(iframe);
        }
    };

    @action public dispatchMigration = async () => {
        this.loading = true;
        await this.initParent();
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (!this.parentBus) {
            throw 'the parentBus is not defined';
        }
        this.parentBus.dispatchEvent('migrate', this.rootStore.settingsStore.JSONState);
        console.log('3 dispatch migration');
        if (isSafari) this.success = true;
    };

    public openIde = () => window.open(newUrl);


    // ============== IFRAME ==============
    @action private initFrame = () => {
        WindowAdapter.createSimpleWindowAdapter(undefined, {origins}).then(async (adapter) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.iframeBus = new Bus(adapter);
            this.iframeBus.once('migrate', this.handleMigrate);
            console.log('2 init iframe');

        });
    };

    private handleMigrate = async (json: string) => {
        console.log('4 start migration');
        const data = JSON.parse(json) as IImportedData;
        const files = data.files;
        const accounts = Object.values(data.accounts.accountGroups)
            .reduce(((acc, {accounts}) => [...acc, ...accounts]), []);
        const customChainIds = accounts.map(({chainId}) => chainId);
        const customNodes = data.customNodes.filter(({chainId}) => customChainIds.includes(chainId));
        await this.rootStore.settingsStore.loadState(files, accounts, customNodes);
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (!this.iframeBus) {
            throw 'the iframeBus is not defined';
        }
        this.iframeBus.dispatchEvent('migration-success', null);
        console.log('5 end migration');
    };


}

export default MigrationStore;
