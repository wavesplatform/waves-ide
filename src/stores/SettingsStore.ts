import { observable, action, computed } from 'mobx';
import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

interface INode {
    chainId: string
    url: string
    system?: boolean
}


class SettingsStore extends SubStore {
    systemNodes: INode[] = [
        {chainId: 'S', url: 'https://nodes-stagenet.wavesnodes.com', system: true},
        {chainId: 'T', url: 'https://testnodes.wavesnodes.com/', system: true},
        {chainId: 'W', url: 'https://nodes.wavesplatform.com/', system: true},
    ];

    @observable nodeTimeout = 60000;
    @observable testTimeout = 60000;
    @observable defaultAdditionalFee = 0;

    @observable customNodes: INode[] = [];

    @observable activeNodeIndex = 1;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.customNodes = initState.customNodes;
            this.activeNodeIndex = initState.activeNodeIndex;
            this.nodeTimeout = initState.nodeTimeout;
            this.defaultAdditionalFee = initState.defaultAdditionalFee || 0;
            this.testTimeout = initState.testTimeout;
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
            defaultAdditionalFee: this.defaultAdditionalFee
        };
    }

    @action
    addNode(node: INode) {
        this.customNodes.push(node);
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

    public serialize = () => ({
        customNodes: this.customNodes,
        activeNodeIndex: this.activeNodeIndex,
        nodeTimeout: this.nodeTimeout,
        defaultAdditionalFee: this.defaultAdditionalFee,
        testTimeout: this.testTimeout
    });

}

export {
    SettingsStore,
    INode
};
