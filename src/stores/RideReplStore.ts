import { action, Lambda, observable, reaction } from 'mobx';
import { repl } from '@waves/ride-js';
import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';

export interface IRideReplHistoryItem {
    command: string
    response: string[]
}

export default class RideReplStore extends SubStore {
    private repl: ReturnType<typeof repl>;
    private historyCommandCursor = 0;

    constructor(rootStore: RootStore) {
        super(rootStore);
        this.repl = this.constructReplWithCurrentSettings();

        reaction(
            () => ({
                defaultNode: this.rootStore.settingsStore.defaultNode,
                activeAccount: this.rootStore.accountsStore.activeAccount
            }),
            ({defaultNode, activeAccount}) => {
                if (activeAccount) {
                    this.repl = this.repl.reconfigure({
                        nodeUrl: defaultNode.url, chainId: defaultNode.chainId, address: activeAccount.address
                    });
                }
            }
        );
    }


    @action
    restartRepl() {
        // this.repl = this.constructReplWithCurrentSettings();
    }

    @observable history: IRideReplHistoryItem[] = [];


    @action
    processCommand = async (cmd: string) => {
        cmd = cmd.trim();
        if (cmd === '') return;
        if (cmd.startsWith(':')) {
            switch (cmd) {
                case ':clear':
                    this.history.length = 0;
                    break;
                case ':reset':
                    this.repl.clear();
                    this.history.length = 0;
                    break;
                default:
                    this.history.push({command: `Unknown command ${cmd}`, response: []});
            }
            return;
        }
        const historyItem: IRideReplHistoryItem = observable({command: cmd, response: []});
        this.history.push(historyItem);
        const resultOrError = await this.repl.evaluate(cmd);
        const resp = 'error' in resultOrError ? resultOrError.error : resultOrError.result;
        historyItem.response = [...historyItem.response, resp];
        this.historyCommandCursor = this.history.length;
    };


    getHistoryCommand = (type: 'previous' | 'next') => {
        if (type === 'previous') {
            if (this.historyCommandCursor === 0) {
                return null;
            } else {
                this.historyCommandCursor -= 1;
                const item = this.history[this.historyCommandCursor];
                return item && item.command;
            }
        } else {
            if (this.historyCommandCursor >= this.history.length) {
                return null;
            } else {
                this.historyCommandCursor += 1;
                return this.historyCommandCursor === this.history.length
                    ? ''
                    : this.history[this.historyCommandCursor].command;
            }
        }

    };

    private constructReplWithCurrentSettings() {
        if (!this.rootStore.accountsStore.activeAccount) {
            return repl();
        } else {
            return repl({
                chainId: this.rootStore.settingsStore.defaultNode.chainId,
                nodeUrl: this.rootStore.settingsStore.defaultNode.url,
                address: this.rootStore.accountsStore.activeAccount.address
            });
        }
    }
}


