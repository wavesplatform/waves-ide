import migrators from '@src/migrations';

import {
    AccountsStore,
    FilesStore,
    NotificationsStore,
    ReplsStore,
    SettingsStore,
    SignerStore,
    TabsStore,
    UIStore,
} from '@stores';

class RootStore {
    private readonly VERSION = 1;

    public accountsStore: AccountsStore;
    public tabsStore: TabsStore;
    public filesStore: FilesStore;
    public settingsStore: SettingsStore;
    public signerStore: SignerStore;
    public notificationsStore: NotificationsStore;
    public replsStore: ReplsStore;
    public uiStore: UIStore;

    constructor(initState?: any) {

        if (initState == null) {
            initState = {};
        } else {
            if (initState.VERSION !== this.VERSION) {
                try {
                    initState = migrators.slice(initState.VERSION, this.VERSION)
                        .reduce((acc, migrator) => migrator.migrate(acc), initState);
                } catch (e) {
                    console.error(e);
                    console.error(
                        `Store version mismatch!\nLocalStorage: ${initState.VERSION} - App: ${this.VERSION}` +
                        'Migration failed!' +
                        'Please clear localStorage if app is not working'
                    );
                }
            }
        }
        console.log(initState);
        this.accountsStore = new AccountsStore(this, initState.accountsStore);
        this.tabsStore = new TabsStore(this, initState.tabsStore);
        this.filesStore = new FilesStore(this, initState.filesStore);
        this.settingsStore = new SettingsStore(this, initState.settingsStore);
        this.signerStore = new SignerStore(this, initState.signerStore);
        this.notificationsStore = new NotificationsStore(this);
        this.replsStore = new ReplsStore(this);
        this.uiStore = new UIStore(this, initState.uiStore);
    }

    public serialize = () => ({
        VERSION: this.VERSION,
        accountsStore: {
            accounts: this.accountsStore.accounts,
            defaultAccountIndex: this.accountsStore.defaultAccountIndex
        },
        tabsStore: {
            tabs: this.tabsStore.tabs,
            activeTabIndex: this.tabsStore.activeTabIndex
        },
        filesStore: {files: this.filesStore.files},
        settingsStore: {
            nodes: this.settingsStore.nodes,
            defaultNodeIndex: this.settingsStore.defaultNodeIndex
        },
        signerStore: {txJson: this.signerStore.txJson},
        // uiStore: {
        //     replsPanel: this.uiStore.replsPanel,
        //     sidePanel: this.uiStore.sidePanel
        // },
    });
}

export default RootStore;
