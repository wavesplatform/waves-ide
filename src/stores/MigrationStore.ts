import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
import { action, observable } from 'mobx';
import styles from '@src/layout/styles.less';
import { IImportedData } from '@stores/SettingsStore';
import { depricatedHost, activeHost } from '@utils/hosts';

const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

const computeOrigins = (isStagenetMigration: boolean) => {
    return isStagenetMigration
        ? [depricatedHost, activeHost]
        : [depricatedHost, activeHost]
}

class MigrationStore extends SubStore {
    private parentBus: Bus | null = null;
    private iframeBus: Bus | null = null;

    @observable migrationState = {
        loading: false,
        success: false
    }

    @observable stagenetMigrationState = {
        loading: false,
        success: false
    }

    constructor(rootStore: RootStore) {
        super(rootStore);
        this.initFrame();
    }

    // ============== PARENT ==============
    @action private initParent = async (isStagenetMigration: boolean) => {
        const origins = computeOrigins(isStagenetMigration)

        const init = (adapter: WindowAdapter) => {
            this.parentBus = new Bus(adapter);
            this.parentBus.once('migration-success', () => {
                console.log('migration-success log')

                if (isStagenetMigration) {
                    this.stagenetMigrationState.loading = false;
                    this.stagenetMigrationState.success = true;
                } else {
                    this.migrationState.loading = false;
                    this.migrationState.success = true;
                }
            });
            console.log('1 init parent');
            return null;
        };


        if (isSafari) {
            const win = this.openIde(isStagenetMigration);
            if (!win) {
                throw 'the window is not open';
            }
            WindowAdapter.createSimpleWindowAdapter(win).then(init);
        } else {
            const iframe = document.createElement('iframe');
            WindowAdapter.createSimpleWindowAdapter(iframe, {origins}).then(init);
            iframe.src = origins[1];
            iframe.className = styles.iframe;
            document.body.appendChild(iframe);
        }
    };

    @action public dispatchMigration = async (isStagenetMigration: boolean = false) => {
        if (isStagenetMigration) {
            this.stagenetMigrationState.loading = true;
        } else {
            this.migrationState.loading = true;
        }

        await this.initParent(isStagenetMigration);
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (!this.parentBus) {
            throw 'the parentBus is not defined';
        }
        this.parentBus.dispatchEvent('migrate', this.rootStore.settingsStore.JSONState);
        console.log('3 dispatch migration');
        if (isSafari) {
            if (isStagenetMigration) {
                this.stagenetMigrationState.loading = false;
                this.stagenetMigrationState.success = true;
            } else {
                this.migrationState.loading = false;
                this.migrationState.success = true;
            }
        }
    };

    public openIde = (isStagenetMigration: boolean) => {
        const origins = computeOrigins(isStagenetMigration);

        return window.open(origins[1]);
    }


    // ============== IFRAME ==============
    @action private initFrame = () => {
        WindowAdapter.createSimpleWindowAdapter().then(async (adapter) => {
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
