import { observable, action, computed } from 'mobx';
import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

interface INode {
    chainId: string
    url: string
    system?: boolean
    info?: string
}

class SettingsStore extends SubStore {
    systemNodes: INode[] = [
        {chainId: 'T', url: 'https://testnodes.wavesnodes.com/', system: true, info: 'info'},
        {chainId: 'W', url: 'https://nodes.wavesplatform.com/', system: true, info: 'info'}
    ];

    @observable customNodes: INode[] = [];

    @observable defaultNodeIndex = 0; //TO DO renaem default.. to active..

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.customNodes = initState.customNodes;
            this.defaultNodeIndex = initState.defaultNodeIndex;
        }
    }

    @computed
    get nodes() {
        return [...this.systemNodes, ...this.customNodes];
    }

    @computed
    get defaultNode() {
        return this.nodes[this.defaultNodeIndex];
    }

    @computed
    get defaultChainId() {
        return this.defaultNode.chainId;
    }

    @computed
    get consoleEnv() {
        const defNode = this.defaultNode;
        if (!defNode) return {};
        const activeAcc = this.rootStore.accountsStore.activeAccount
        return {
            API_BASE: defNode.url,
            CHAIN_ID: defNode.chainId,
            SEED: activeAcc && activeAcc.seed,
            accounts: this.rootStore.accountsStore.accounts.map(acc => acc.seed),
            isScripted: activeAcc && activeAcc.isScripted
        };
    }

    @action
    addNode(node: INode) {
        this.customNodes.push(node);
    }

    @action
    deleteNode(i: number) {
        this.customNodes.splice(i - 2, 1);

        if (this.defaultNodeIndex >= i) this.defaultNodeIndex -= 1;
    }

    @action
    updateNode(value: string, i: number, field: 'url' | 'chainId') {
        this.customNodes[i - 2][field] = value;
    }

    @action
    setDefaultNode(i: number) {
        this.defaultNodeIndex = i;
    }
}

export {
    SettingsStore,
    INode
};
