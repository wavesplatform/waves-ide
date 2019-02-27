import { observable, action, computed, toJS } from 'mobx';
import { createTransformer } from 'mobx-utils';
import { generateMnemonic } from 'bip39';

class SubStore {
    constructor(public rootStore: RootStore) {
    }
}

interface IAccount {
    label: string
    seed: string
    default: boolean
}

class RootStore {
    private readonly VERSION = '0.1';

    public accountsStore: AccountsStore;
    public tabsStore: TabsStore;
    public filesStore: FilesStore;
    public settingsStore: SettingsStore;

    constructor(initState: any = {}) {
        if (initState.VERSION !== this.VERSION) {
            // Todo: add migration loaders instead of error reporting
            console.error(`Store version mismatch!\nLocalStorage: ${initState.VERSION} - App: ${this.VERSION}
             Please clear localStorage if app is not working`);
        }
        this.accountsStore = new AccountsStore(this, initState.accountsStore);
        this.tabsStore = new TabsStore(this, initState.tabsStore);
        this.filesStore = new FilesStore(this, initState.filesStore);
        this.settingsStore = new SettingsStore(this, initState.settingsStore);
    }

    // public serialize = createTransformer(() => ({
    //     VERSION: this.VERSION,
    //     accountsStore: this.accountsStore.accounts,
    //     tabsStore: this.tabsStore.tabs,
    //     filesStore: this.filesStore.files,
    //     settingsStore: this.settingsStore.nodes
    // }));
}

class AccountsStore extends SubStore {
    @observable accounts: IAccount[];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.accounts = [{
                seed: generateMnemonic(),
                label: 'Account 1',
                default: true
            }];
        } else {
            this.accounts = initState.accounts;
        }
    }

    @computed
    get defaultAccount() {
        return this.accounts.find(acc => acc.default);
    }

    @computed
    get defaultAccountIndex() {
        return this.accounts.findIndex(acc => acc.default);
    }

    @action
    addAccount(account: IAccount) {
        this.accounts.push(account);
    }

    @action
    setDefaultAccount(i: number) {
        this.accounts.forEach((acc, index) => acc.default = index === i);
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

type TTab = IEditorTab | IWelcomeTab;

interface ITab {
    type: TAB_TYPE
    active: boolean
}

interface IEditorTab extends ITab {
    type: TAB_TYPE.EDITOR,
    fileId: string
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}

class TabsStore extends SubStore {
    @observable tabs: TTab[];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.tabs = [];
        } else {
            this.tabs = initState.tabs;
        }
    }

    @computed
    get activeTab() {
        return this.tabs.find(tab => tab.active);
    }

    @computed
    get activeTabIndex() {
        return this.tabs.findIndex(tab => tab.active);
    }

    @action
    addTab(tab: TTab) {
        this.tabs.push(tab);
        this.selectTab(this.tabs.length - 1);
    }

    @action
    selectTab(i: number) {
        this.tabs.forEach((tab, index) => tab.active = index === i);
    }

    @action
    closeTab(i: number) {
        if (this.tabs[i].active) {
            const neighborTab = this.tabs[i - 1] && this.tabs[i + 1];
            if (neighborTab) neighborTab.active = true;
        }
        this.tabs.splice(i, 1);
    }
}

export enum FILE_TYPE {
    ASSET_SCRIPT,
    ACCOUNT_SCRIPT,
    JS_TEST
}

interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
}

class FilesStore extends SubStore {
    @observable files: IFile[] = [];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.files = [];
        } else {
            this.files = initState.files;
        }
    }

    @action
    addFile(file: IFile) {
        this.files.push(file);
    }

    @action
    deleteFile(id: string) {
        const i = this.files.findIndex(file => file.id === id);
        if (i > -1) this.files.splice(i, 1);
    }

    @action
    changeFileContent(id: string, newContent: string) {
        const file = this.files.find(file => file.id === id);
        if (file != null) file.content = newContent;
    }

    @action
    renameFile(id: string, newName: string) {
        const file = this.files.find(file => file.id === id);
        if (file != null) file.name = newName;
    }
}

interface INode {
    chainId: string
    url: string
    default: boolean
}

class SettingsStore extends SubStore {
    @observable nodes: INode[];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.nodes = [
                {chainId: 'T', url: 'https://testnodes.wavesnodes.com/', default: true},
                {chainId: 'W', url: 'https://nodes.wavesplatform.com/', default: false}
            ];
        } else {
            this.nodes = initState.nodes;
        }
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
        this.nodes.forEach((node, index) => node.default = index === i);
    }
}
