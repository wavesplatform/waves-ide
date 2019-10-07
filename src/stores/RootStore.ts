import migrators from '@src/migrations';

import {
    AccountsStore,
    CompilationStore,
    FilesStore,
    NotificationsStore,
    ReplsStore,
    SettingsStore,
    SignerStore,
    TabsStore,
    UIStore,
} from '@stores';
import RideReplStore from '@stores/RideReplStore';

class RootStore {
    private readonly VERSION = 8;

    public accountsStore: AccountsStore;
    public tabsStore: TabsStore;
    public filesStore: FilesStore;
    public settingsStore: SettingsStore;
    public signerStore: SignerStore;
    public notificationsStore: NotificationsStore;
    public replsStore: ReplsStore;
    public uiStore: UIStore;
    public compilationStore: CompilationStore;
    public rideReplStore: RideReplStore;

    constructor(initState?: any) {

        if (initState == null) {
            initState = {};
        } else {
            if (initState.VERSION !== this.VERSION) {
                try {
                    initState = migrators.slice(initState.VERSION, this.VERSION + 1)
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
        this.uiStore = new UIStore(this, initState.uiStore);
        this.notificationsStore = new NotificationsStore(this);
        this.replsStore = new ReplsStore(this);
        this.compilationStore = new CompilationStore(this);
        this.rideReplStore = new RideReplStore(this);
    }

    public serialize = () => ({
        VERSION: this.VERSION,
        tabsStore: this.tabsStore.serialize(),
        filesStore: this.filesStore.serialize(),
        settingsStore: this.settingsStore.serialize(),
        accountsStore: this.accountsStore.serialize(),
        signerStore: {txJson: this.signerStore.txJson},
        uiStore: {
            replsPanel: this.uiStore.replsPanel,
            resizables: this.uiStore.resizables,
            editorSettings: this.uiStore.editorSettings
        },
    });
}

export default RootStore;
