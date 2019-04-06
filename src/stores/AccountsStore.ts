import { observable, action, computed } from 'mobx';

import { generateMnemonic } from 'bip39';
import { libs } from '@waves/waves-transactions';
const { privateKey, publicKey, address } = libs.crypto;

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

interface IAccount {
    seed: string
    label: string
    chainId: string
    address?: string
    publicKey?: string
    privateKey?: string
}

class AccountsStore extends SubStore {
    private createObsAccount = (account: IAccount): IAccount => {
        return observable({
            seed: account.seed,
            label: account.label,
            chainId: account.chainId,
            get address() {
                return address(this.seed, this.chainId);
            },
            get publicKey() {
                return publicKey(this.seed);
            },
            get privateKey() {
                return privateKey(this.seed);
            }
        });
    }

    @observable chainIdAccountGroupMap: Record<string, {activeAccountIndex: number, accounts: IAccount[]}> = {
        'W': {
            accounts: [],
            activeAccountIndex: 0
        },
        'T': {
            accounts: [],
            activeAccountIndex: 0
        },
    };

    @action
    private getAccountGroupByChainId(chainId: string) {
        let result = this.chainIdAccountGroupMap[chainId];

        if (result == null) {
            result = observable({
                accounts: [{seed: generateMnemonic(), label: 'Account 1'}],
                activeAccountIndex: 0
            })

            this.chainIdAccountGroupMap[chainId] = result;
        }
        return result;
    }

    @computed
    get accounts() {
        const chainId = this.rootStore.settingsStore.defaultNode.chainId;

        return this.getAccountGroupByChainId[chainId].accounts;
    }

    @computed
    get activeAccountIndex(){
        return this.getAccountGroupByChainId[chainId].activeAccountIndex;
    }

    @computed
    get activeAccount() {
        return this.accounts[this.activeAccountIndex];
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

        const newAccount = this.createObsAccount({
            seed: generateMnemonic(),
            label: `Account ${maxLabel + 1}`,
            chainId: this.rootStore.settingsStore.defaultNode.chainId,
        });

        this.addAccount(newAccount);
    }

    @action
    setDefaultAccount(i: number) {
        this.activeAccountIndex = i;
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

    
    // @observable accounts: IAccount[] = [];

    // // @observable accounts: IAccount[] = [this.createObsAccount({
    // //     seed: generateMnemonic(),
    // //     label: 'Account 1',
    // //     chainId: this.rootStore.settingsStore.defaultNode.chainId
    // // })];

    // @observable activeAccountIndex = 0;

    // constructor(rootStore: RootStore, initState: any) {
    //     super(rootStore);

    //     if (initState != null) {
    //         this.accounts = initState.accounts.map(this.createObsAccount);
    //         this.activeAccountIndex = initState.activeAccountIndex;
    //     }
    // }

    // @computed
    // get activeNodeAccounts() {
    //     const chainId = this.rootStore.settingsStore.defaultNode.chainId;

    //     return this.accounts.filter(account => account.chainId === chainId);
    // }
}

export {
    AccountsStore,
    IAccount
};
