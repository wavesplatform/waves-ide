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
    private readonly VERSION = 4;

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

        this.tabsStore = new TabsStore(this, initState.tabsStore);
        this.filesStore = new FilesStore(this, initState.filesStore);
        this.settingsStore = new SettingsStore(this, initState.settingsStore);
        this.accountsStore = new AccountsStore(this, initState.accountsStore);
        this.signerStore = new SignerStore(this, initState.signerStore);
        this.notificationsStore = new NotificationsStore(this);
        this.replsStore = new ReplsStore(this);
        this.uiStore = new UIStore(this, initState.uiStore);
    }

    public serialize = () => ({
        VERSION: this.VERSION,
        tabsStore: {
            tabs: this.tabsStore.tabs,
            activeTabIndex: this.tabsStore.activeTabIndex
        },
        filesStore: this.filesStore.serialize(),
        settingsStore: {
            customNodes: this.settingsStore.customNodes,
            defaultNodeIndex: this.settingsStore.defaultNodeIndex
        },
        accountsStore: this.accountsStore.serialize(),
        signerStore: {txJson: this.signerStore.txJson},
        uiStore: {
            replsPanel: this.uiStore.replsPanel,
            sidePanel: this.uiStore.sidePanel,
            editorSettings: this.uiStore.editorSettings
        },
    });
}

export default RootStore;
