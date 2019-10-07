import { observable, action, computed } from 'mobx';
import { repl } from '@waves/ride-js';
import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';

export interface IRideReplHistoryItem {
    command: string
    response: string[]
}

export default class RideReplStore extends SubStore {
    private repl: ReturnType<typeof repl>;

    constructor(rootStore: RootStore) {
        super(rootStore);
        this.repl = this.constructReplWithCurrentSettings();

    }

    @action
    restartRepl(){
        // this.repl = this.constructReplWithCurrentSettings();
    }

    @observable history: IRideReplHistoryItem[] = [];

    @action
    processCommand = async (cmd: string) => {
        const historyItem: IRideReplHistoryItem = observable({command: cmd, response: []});
        this.history.push(historyItem);
        const resultOrError = await this.repl.evaluate(cmd);
        const resp = 'error' in resultOrError ? resultOrError.error : resultOrError.result;
        historyItem.response = [...historyItem.response, resp];
    };

    private constructReplWithCurrentSettings(){
        if (!this.rootStore.accountsStore.activeAccount){
            return repl();
        }else {
            return repl({
                chainId: this.rootStore.settingsStore.defaultNode.chainId,
                nodeUrl: this.rootStore.settingsStore.defaultNode.url,
                address: this.rootStore.accountsStore.activeAccount.address
            });
        }
    }
}


