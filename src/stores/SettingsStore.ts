import { action, computed, observable, Lambda, runInAction, reaction } from 'mobx';
import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { mediator } from '@src/services';
import { EVENTS } from '@src/layout/Main/TabContent/Editor';
import { NETWORKS } from '@src/constants';
import { saveAs } from 'file-saver';
import { TFile } from '@stores/File';
import { IAccount, IAccountGroup } from '@stores/AccountsStore';
import { getNetworkByte } from '@utils';
import { validateNodeUrl } from '@utils/validators';
import { activeHostSecure } from '@utils/hosts';

type NodeParams = {
    chainId: string
    url: string
    system?: boolean
    faucet?: string
};

export interface IImportedData {
    accounts: { accountGroups: Record<string, IAccountGroup> },
    customNodes: Node[]
    files: TFile[]
}

class SettingsStore extends SubStore {
    systemNodes: Node[] = [
        // new Node({...NETWORKS.STAGENET, system: true}),
        new Node({...NETWORKS.MAINNET, system: true}),
        new Node({...NETWORKS.TESTNET, system: true})
    ];

    @observable nodeTimeout = 60000;
    @observable testTimeout = 60000;
    @observable defaultAdditionalFee = 0;
    @observable theme: 'light' | 'dark' = 'light';
    @observable customNodes: Node[] = [];
    @observable isCompaction: boolean = true;
    @observable isRemoveUnusedCode: boolean = true;

    @observable activeNodeIndex = 0;

    @observable importStorageData: IImportedData | null = null;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            initState.customNodes.forEach((node: NodeParams) => {
                this.addNode(node);
            });

            this.activeNodeIndex = initState.activeNodeIndex;
            this.nodeTimeout = initState.nodeTimeout;
            this.defaultAdditionalFee = initState.defaultAdditionalFee || 0;
            this.testTimeout = initState.testTimeout;
            this.theme = initState.theme || 'light';
            this.isCompaction = initState.isCompaction;
            this.isRemoveUnusedCode = initState.isRemoveUnusedCode;
        }
    }

    @computed
    get nodes() {
        return [...this.systemNodes, ...this.customNodes];
    }

    @computed
    get defaultNode() {
        return this.nodes[this.activeNodeIndex];
    }

    @computed
    get defaultChainId() {
        return this.defaultNode.chainId;
    }

    @computed
    get isNodePool() {
        return !!Object.entries(NETWORKS)
            .map(([, node]) => node)
            .find(node => {
                const defaultNodeUrl = this.defaultNode.isValidUrlFormat
                    ? new URL(this.defaultNode.url).host
                    : this.defaultNode.url;

                return node.url.includes(defaultNodeUrl);
            });
    }

    @computed
    get nodeRequestOptions(): RequestInit {
        return {
            credentials: this.isNodePool ? 'include' : 'same-origin'
        };
    }


    @computed
    get consoleEnv() {
        const defNode = this.defaultNode;
        if (!defNode) return {};
        const activeAcc = this.rootStore.accountsStore.activeAccount;
        return {
            API_BASE: defNode.url,
            CHAIN_ID: defNode.chainId,
            SEED: activeAcc && activeAcc.seed,
            accounts: this.rootStore.accountsStore.accounts.map(acc => acc.seed),
            isScripted: activeAcc && activeAcc.isScripted,
            timeout: this.nodeTimeout,
            mochaTimeout: this.testTimeout,
            defaultAdditionalFee: this.defaultAdditionalFee,
            file: this.rootStore.filesStore.getFileContent,
            requestOptions: this.nodeRequestOptions
        };
    }

    @computed
    get contextInfo() {
        const accString = this.rootStore.accountsStore.activeAccount
            ? `Selected account: ${this.rootStore.accountsStore.activeAccount.address}`
            : 'No account selected';
        const currentNode = this.rootStore.settingsStore.defaultNode;
        return `${accString}. Using node: ${currentNode.url} with chainId ${currentNode.chainId}`;
    }

    @action
    addNode(node: NodeParams) {
        const newNode = new Node(node);

        this.customNodes.push(newNode);
    }

    @action
    deleteNode(i: number) {
        this.customNodes.splice(i - 2, 1);
        if (this.activeNodeIndex >= i) this.activeNodeIndex -= 1;
    }

    @action
    updateNode(value: string, i: number, field: 'url' | 'chainId') {
        this.customNodes[i - 2][field] = value;
    }

    @action
    setDefaultNode(i: number) {
        this.activeNodeIndex = i;
    }

    @action
    updateTimeout(t: number, field: 'node' | 'test') {
        if (field === 'node') {
            this.nodeTimeout = t;
        } else if (field === 'test') {
            this.testTimeout = t;
        }
    }

    @action
    toggleIsCompaction() {
        this.isCompaction = !this.isCompaction;
    }

    @action
    toggleIsRemoveUnusedCode() {
        this.isRemoveUnusedCode = !this.isRemoveUnusedCode;
    }

    @action
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        mediator.dispatch(EVENTS.UPDATE_THEME, this.theme);
    }

    get JSONState() {
        return JSON.stringify({
            accounts: this.rootStore.accountsStore.serialize(),
            files: this.rootStore.filesStore.files,
            customNodes: this.rootStore.settingsStore.customNodes.map(node => ({
                chainId: node.chainId,
                url: node.url
            }))
        });
    }

    exportState() {
        const blob = new Blob([this.JSONState], {type: 'application/json'});
        saveAs(blob, 'state.json');
    }

    @action
    async loadState(files: TFile[] = [], accounts: IAccount[] = [], customNodes: Node[] = []) {
        try {
            await Promise.all(files.map(({type, content, name}) => {
                this.rootStore.filesStore.createFile({type, content, name});
            }));

            customNodes.forEach(node =>
                !this.customNodes.some(({chainId, url}) =>
                    chainId === node.chainId && url === node.url) && this.addNode(node));

            this.rootStore.accountsStore.addAccounts(accounts);
        } catch (e) {
            console.log(e);
        }
        this.rootStore.notificationsStore.notify('Projects and accounts successfully imported', {type: 'success'});
    }


    public serialize = () => ({
        customNodes: this.rootStore.settingsStore.customNodes.map(node => ({
            chainId: node.chainId,
            url: node.url
        })),
        activeNodeIndex: this.activeNodeIndex,
        nodeTimeout: this.nodeTimeout,
        defaultAdditionalFee: this.defaultAdditionalFee,
        testTimeout: this.testTimeout,
        theme: this.theme,
        isCompaction: this.isCompaction,
        isRemoveUnusedCode: this.isRemoveUnusedCode,
    });

}

class Node {
    @observable chainId: string = NETWORKS.TESTNET.chainId;
    @observable url: string = NETWORKS.TESTNET.url;
    @observable system: boolean = false;
    @observable faucet?: string = NETWORKS.TESTNET.faucet;
    @observable isValidNodeUrl: boolean = true;
    @observable isValidChainId: boolean = true;

    constructor(params: NodeParams) {
        this.chainId = params.chainId;
        this.url = params.url;
        this.system = !!params.system;

        reaction(() => this.url,
            async (url) => {
                this.chainId = await getNetworkByte(this.url) || '';
                const isValidNodeUrl = await validateNodeUrl(url);

                runInAction(() => this.isValidNodeUrl = isValidNodeUrl);
            }, {fireImmediately: true});
    }

    @computed
    get isSecure() {
        try {
            const nodeUrl = new URL(this.url);

            return !(activeHostSecure.includes(window.origin) && nodeUrl.protocol !== 'https:');
        } catch (error) {
            return false;
        }
    }

    @computed
    get isValidUrlFormat() {
        try {
            const nodeUrl = new URL(this.url);

            return true;
        } catch (error) {
            return false;
        }
    }

    @computed
    get isValid() {
        return this.isValidUrlFormat && this.isSecure && this.isValidNodeUrl && this.isValidChainId;
    }
}


export {
    SettingsStore,
    Node,
    NodeParams
};
