import { observable, action, computed } from 'mobx';
import { v4 as uuid } from 'uuid';
import { generateMnemonic } from 'bip39';
import migrators from '../migrations';

type Overwrite<T1, T2> = {
    [P in Exclude<keyof T1, keyof T2>]: T1[P]
} & T2;

class SubStore {
    constructor(public rootStore: RootStore) {
    }
}


export class RootStore {
    private readonly VERSION = 1;

    public accountsStore: AccountsStore;
    public tabsStore: TabsStore;
    public filesStore: FilesStore;
    public settingsStore: SettingsStore;
    public signerStore: SignerStore;
    public notificationsStore: NotificationsStore;
    public replsStore: ReplsStore;

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
        signerStore: {txJson: this.signerStore.txJson}
    });
}

export interface IAccount {
    label: string
    seed: string
}

export class AccountsStore extends SubStore {
    @observable accounts: IAccount[] = [{
        seed: generateMnemonic(),
        label: 'Account 1',
    }];
    @observable defaultAccountIndex = 0;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.accounts = initState.accounts;
            this.defaultAccountIndex = initState.defaultAccountIndex;
        }
    }

    @computed
    get defaultAccount() {
        return this.accounts[this.defaultAccountIndex];
    }

    @action
    addAccount(account: IAccount) {
        this.accounts.push(account);
    }

    @action
    createAccount(seed: string) {
        const maxLabel = Math.max(...this.accounts.map(account => {
            const match = account.label.match(/Account (\d+)/);
            if (match != null) return parseInt(match[1]);
            else return 0;
        }));
        this.addAccount({seed, label: `Account ${maxLabel + 1}`});
    }

    @action
    setDefaultAccount(i: number) {
        this.defaultAccountIndex = i;
    }

    @action
    deleteAccount(i: number) {
        this.accounts.splice(i, 1);
    }

    @action
    setAccountLabel(i: number, label: string) {
        this.accounts[i].label = label;
    }

    @action
    setAccountSeed(i: number, seed: string) {
        this.accounts[i].seed = seed;
    }

}

export enum TAB_TYPE {
    EDITOR,
    WELCOME
}

export type TTab = IEditorTab | IWelcomeTab;

interface ITab {
    type: TAB_TYPE
    //active: boolean
}

interface IEditorTab extends ITab {
    type: TAB_TYPE.EDITOR,
    fileId: string
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}

export class TabsStore extends SubStore {
    @observable tabs: TTab[] = [];
    @observable activeTabIndex = -1;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.tabs = initState.tabs;
            this.activeTabIndex = initState.activeTabIndex;
        }
    }

    @computed
    get activeTab() {
        // Out of bound indices will not be tracked by MobX, need to check array length.
        // See https://github.com/mobxjs/mobx/issues/381, https://github.com/mobxjs/mobx/blob/gh-pages/docs/best/react.md#incorrect-access-out-of-bounds-indices-in-tracked-function
        return this.tabs.length < 1
            ? undefined
            : this.tabs[this.activeTabIndex];
    }

    @action
    addTab(tab: TTab) {
        this.tabs.push(tab);
        this.selectTab(this.tabs.length - 1);
    }

    @action
    selectTab(i: number) {
        this.activeTabIndex = i;
    }

    @action
    closeTab(i: number) {
        this.tabs.splice(i, 1);
        if (this.activeTabIndex >= i) this.activeTabIndex -= 1;
        if (this.activeTabIndex < 0) this.activeTabIndex = 0;
    }

    @action
    openFile(fileId: string) {
        const openedFileTabIndex = this.tabs.findIndex(t =>  t.type === TAB_TYPE.EDITOR && t.fileId === fileId);
        if (openedFileTabIndex > -1){
            this.selectTab(openedFileTabIndex);
        }else {
            this.addTab({type: TAB_TYPE.EDITOR, fileId});
            this.activeTabIndex = this.tabs.length - 1;
        }
    }
}

export enum FILE_TYPE {
    ASSET_SCRIPT = 'assetScript',
    ACCOUNT_SCRIPT = 'accountScript',
    DELETED = 'deleted',
    TUTORIALS = 'tutorials',
    ACCOUNT_SAMPLES = 'smart-accounts',
    ASSET_SAMPLES = 'smart-assets',
    TEST = 'test',
}

export interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
}

export class FilesStore extends SubStore {
    @observable files: IFile[] = [];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.files = initState.files;
        }
    }

    @computed
    get currentFile() {
        const activeTab = this.rootStore.tabsStore.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR) {
            return this.files.find(file => file.id === activeTab.fileId);
        } else return;
    }

    private generateFilename(type: FILE_TYPE) {
        let maxIndex = Math.max(...this.files.filter(file => file.type === type).map(n => n.name)
                .filter(l => l.startsWith(type.toString()))
                .map(x => parseInt(x.replace(type + '_', '')) || 0),
            0
        );
        return type + '_' + (maxIndex + 1);
    }

    fileById(id: string) {
        return this.files.find(file => file.id === id);
    }

    @action
    createFile(file: Overwrite<IFile, { id?: string, name?: string }>, open = false) {
        const newFile = {
            id: uuid(),
            name: this.generateFilename(file.type),
            ...file
        };
        if (this.files.some(file => file.id === newFile.id)) {
            throw new Error(`Duplicate identifier ${newFile.id}`);
        }
        this.files.push(newFile);
        if (open) {
            this.rootStore.tabsStore.openFile(newFile.id);
        }
        return newFile;
    }

    @action
    deleteFile(id: string) {
        const i = this.files.findIndex(file => file.id === id);
        if (i > -1) this.files.splice(i, 1);

        // if deleted file was opened in active tab close tab
        const tabsStore = this.rootStore.tabsStore;
        const activeTab = tabsStore.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR && activeTab.fileId === id) {
            tabsStore.closeTab(tabsStore.activeTabIndex);
        }
    }

    @action
    changeFileContent(id: string, newContent: string) {
        const file = this.fileById(id);
        if (file != null) file.content = newContent;
    }

    @action
    renameFile(id: string, newName: string) {
        const file = this.fileById(id);
        if (file != null) file.name = newName;
    }
}

interface INode {
    chainId: string
    url: string
}

export class SettingsStore extends SubStore {
    @observable nodes: INode[] = [
        {chainId: 'T', url: 'https://testnodes.wavesnodes.com/'},
        {chainId: 'W', url: 'https://nodes.wavesplatform.com/'}
    ];
    @observable defaultNodeIndex = 0;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.nodes = initState.nodes;
        }
    }

    @computed
    get defaultNode() {
        return this.nodes[this.defaultNodeIndex];
    }

    @computed
    get consoleEnv() {
        const defNode = this.defaultNode;
        if (!defNode) return {};
        return {
            API_BASE: defNode.url,
            CHAIN_ID: defNode.chainId,
            SEED: this.rootStore.accountsStore.defaultAccount && this.rootStore.accountsStore.defaultAccount.seed,
            accounts: this.rootStore.accountsStore.accounts.map(acc => acc.seed)
        };
    }

    @action
    addNode(node: INode) {
        this.nodes.push(node);
    }

    @action
    deleteNode(i: number) {
        this.nodes.splice(i, 1);
    }

    @action
    setDefaultNode(i: number) {
        this.defaultNodeIndex = i;
    }
}

export class SignerStore extends SubStore {
    @observable txJson: string;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.txJson = '';
        } else {
            this.txJson = initState.txJson;
        }
    }

    @action
    setTxJson(newTxJson: string) {
        this.txJson = newTxJson;
    }
}

export class NotificationsStore extends SubStore {
    @observable notification = '';

    @action
    notifyUser(text: string) {
        this.notification = text;
    }
}

export class ReplsStore extends SubStore {
    @observable repls: { [name: string]: IRepl } = {};

    @action
    addRepl(repl: IRepl) {
        this.repls[repl.name] = repl;
    }
}

interface IRepl {
    name: string,
    instance: any,
    // isOpened: boolean
}
