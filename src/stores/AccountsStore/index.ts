import { observable, action, computed } from 'mobx';

import { generateMnemonic } from 'bip39';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

import { IAccount } from '@src/types';

class AccountsStore extends SubStore {
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

export default AccountsStore;
