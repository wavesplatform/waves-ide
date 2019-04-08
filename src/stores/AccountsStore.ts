import { observable, action, computed, reaction } from 'mobx';

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
    private buildObservableAccount = (account: IAccount): IAccount => {
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

    private newChainIdAddReaction = () => {
        reaction(
            () => this.rootStore.settingsStore.defaultChainId,
            defaultChainId => {    
                let chainIdGroup = this.accountsGroups[defaultChainId];

                if (chainIdGroup == null) {
                    chainIdGroup = observable({
                        accounts: [],
                        activeAccountIndex: 0
                    });

                    this.accountsGroups[defaultChainId] = chainIdGroup;
                }
            }
        );
    }

    @observable accountsGroups: Record<string, { accounts: IAccount[], activeAccountIndex: number }> = {
        'W': {
            accounts: [],
            activeAccountIndex: 0
        },
        'T': {
            accounts: [],
            activeAccountIndex: 0
        },
    };

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            this.accountsGroups = initState.accountsGroups;
        }

        this.newChainIdAddReaction();
    }
  
    @computed
    get activeAccountsGroup() {
        const chainId = this.rootStore.settingsStore.defaultNode.chainId;

        let chainIdGroup = this.accountsGroups[chainId];

        return chainIdGroup;
    }

    @computed
    get accounts() {
        debugger;
        return this.activeAccountsGroup.accounts;
    }

    @computed
    get activeAccountIndex() {
        return this.activeAccountsGroup.activeAccountIndex;
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

        const newAccount = this.buildObservableAccount({
            seed: generateMnemonic(),
            label: `Account ${maxLabel + 1}`,
            chainId: this.rootStore.settingsStore.defaultNode.chainId,
        });

        this.addAccount(newAccount);
    }

    @action
    setDefaultAccount(i: number) {
        this.activeAccountsGroup.activeAccountIndex = i;
    }

    @action
    deleteAccount(i: number) {
        this.activeAccountsGroup.accounts.splice(i, 1);
    }

    @action
    setAccountLabel(i: number, label: string) {
        this.activeAccountsGroup.accounts[i].label = label;
    }

    @action
    setAccountSeed(i: number, seed: string) {
        this.activeAccountsGroup.accounts[i].seed = seed;
    }
}

export {
    AccountsStore,
    IAccount
};
