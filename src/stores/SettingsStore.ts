import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

interface INode {
    chainId: string
    url: string
}

class SettingsStore extends SubStore {
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

export {
    SettingsStore,
    INode
};
