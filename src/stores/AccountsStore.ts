import { observable, action, computed } from 'mobx';

import { generateMnemonic } from 'bip39';
import { libs } from '@waves/waves-transactions';
const { privateKey, publicKey, address } = libs.crypto;

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

interface IAccount {
    seed: string
    label: string
    // chainId?: string
    address?: string
    publicKey?: string
    privateKey?: string
}

class AccountsStore extends SubStore {
    private createObsAccount = (account: IAccount): IAccount => {
        const settingsStore = this.rootStore.settingsStore;

        return observable({
            seed: account.seed,
            label: account.label,
            // chainId: settingsStore.defaultNode.chainId,
            get address() {
                console.log(address(this.seed, settingsStore.defaultNode.chainId));
                return address(this.seed, settingsStore.defaultNode.chainId);
            },
            get publicKey() {
                return publicKey(this.seed);
            },
            get privateKey() {
                return privateKey(this.seed);
            }
        });
    }
    
    @observable accounts: IAccount[] = [this.createObsAccount({
        seed: generateMnemonic(),
        label: 'Account 1'
    })];

    @observable defaultAccountIndex = 0;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            this.accounts = initState.accounts.map(this.createObsAccount);
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

        const newAccount = this.createObsAccount({
            seed: generateMnemonic(),
            label: `Account ${maxLabel + 1}`,
            // chainId: this.rootStore.settingsStore.defaultNode.chainId,
        });

        this.addAccount(newAccount);
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

export {
    AccountsStore,
    IAccount
};
