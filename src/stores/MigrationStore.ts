import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
import { action, observable } from 'mobx';
import styles from '@src/layout/styles.less';
import { IImportedData } from '@stores/SettingsStore';


export const oldUrls = ['http://localhost:8081'];
export const newUrls = ['http://localhost:8080'];
export const isOldUrl = oldUrls.includes(window.origin);
export const isNewUrl = newUrls.includes(window.origin);

class MigrationStore extends SubStore {
    private parentBus: Bus | null = null;
    private iframeBus: Bus | null = null;
    @observable public ready = false;
    @observable public success = false;

    constructor(rootStore: RootStore) {
        super(rootStore);
        isOldUrl && this.initParent();
        isNewUrl && this.initFrame();
    }

    // ============== PARENT ==============
    @action private initParent = () => {
        const init = (adapter: WindowAdapter) => {
            this.parentBus = new Bus(adapter);
            this.parentBus.once('ready', () => {
                this.ready = true;
            });
            this.parentBus.once('migration-success', () => {
                this.success = true;
            });
        };

        const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

        if (isSafari) {
            const win = this.openIde();
            win && WindowAdapter.createSimpleWindowAdapter(win, {origins: '*'}).then(init);
        } else {
            const iframe = document.createElement('iframe');
            WindowAdapter.createSimpleWindowAdapter(iframe, {origins: '*'}).then(init);
            iframe.src = newUrls[0];
            iframe.className = styles.iframe;
            document.body.appendChild(iframe);
        }
    };

    @action public dispatchMigration = () => {
        this.ready = false;
        this.parentBus && this.parentBus.dispatchEvent('migrate', this.rootStore.settingsStore.JSONState);
    };

    public openIde = () => window.open(newUrls[0]);


    // ============== IFRAME ==============
    @action private initFrame = () => {
        WindowAdapter.createSimpleWindowAdapter(undefined, {origins: '*'}).then(async (adapter) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.iframeBus = new Bus(adapter);
            this.iframeBus.dispatchEvent('ready', null);
            this.iframeBus.once('migrate', this.handleMigrate);
        });
    };

    private handleMigrate = async (json: string) => {
        const data = JSON.parse(json) as IImportedData;
        const files = data.files;
        const accounts = Object.values(data.accounts.accountGroups)
            .reduce(((acc, {accounts}) => [...acc, ...accounts]), []);
        const customChainIds = accounts.map(({chainId}) => chainId);
        const customNodes = data.customNodes.filter(({chainId}) => customChainIds.includes(chainId));
        await this.rootStore.settingsStore.loadState(files, accounts, customNodes);
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.iframeBus && this.iframeBus.dispatchEvent('migration-success', null);
    };


}

export default MigrationStore;
