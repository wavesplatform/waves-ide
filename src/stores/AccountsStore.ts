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
    @observable accountGroups: Record<string, { accounts: IAccount[], activeAccountIndex: number }> = {
        'W': {
            accounts: [],
            activeAccountIndex: -1
        },
        'T': {
            accounts: [],
            activeAccountIndex: -1
        },
    };

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

    private newChainIdReaction = () => {
        reaction(
            () => this.rootStore.settingsStore.defaultChainId,
            defaultChainId => {    
                let chainIdGroup = this.accountGroups[defaultChainId];

                if (chainIdGroup == null) {
                    chainIdGroup = observable({
                        accounts: [],
                        activeAccountIndex: -1
                    });

                    this.accountGroups[defaultChainId] = chainIdGroup;
                }
            }
        );
    }

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            this.accountGroups = initState.accountGroups;
        }

        this.newChainIdReaction();
    }
  
    @computed
    get activeChainIdAccountGroup() {
        const chainId = this.rootStore.settingsStore.defaultChainId;

        return this.accountGroups[chainId];
    }

    @computed
    get accounts() {
        return this.activeChainIdAccountGroup.accounts;
    }

    @computed
    get activeAccountIndex() {
        return this.activeChainIdAccountGroup.activeAccountIndex;
    }

    @computed
    get activeAccount() {
        return this.accounts.length < 1
            ? undefined
            : this.accounts[this.activeAccountIndex];
    }

    @action
    addAccount(account: IAccount) {
        this.accounts.push(account);

        if (this.accounts.length === 1) {
            this.setActiveAccount(0);
        }
    }

    @action
    deleteAccount(i: number) {
        this.activeChainIdAccountGroup.accounts.splice(i, 1);

        const activeAccountIndex = this.activeChainIdAccountGroup.activeAccountIndex;

        if (activeAccountIndex >= i) {
            this.setActiveAccount(activeAccountIndex - 1);
        }
    }

    @action
    setActiveAccount(i: number) {
        this.activeChainIdAccountGroup.activeAccountIndex = i;
    }

    @action
    setAccountLabel(i: number, label: string) {
        this.activeChainIdAccountGroup.accounts[i].label = label;
    }

    @action
    setAccountSeed(i: number, seed: string) {
        this.activeChainIdAccountGroup.accounts[i].seed = seed;
    }

    @action
    generateAccount() {
        let maxLabel = Math.max(...this.accounts.map(account => {
            const match = account.label.match(/Account (\d+)/);
            if (match != null) return parseInt(match[1]);
            else return 0;
        }));

        maxLabel = maxLabel === -Infinity ? 0 : maxLabel;

        const newAccount = this.buildObservableAccount({
            seed: generateMnemonic(),
            label: `Account ${maxLabel + 1}`,
            chainId: this.rootStore.settingsStore.defaultChainId
        });

        this.addAccount(newAccount);
    }
}

export {
    AccountsStore,
    IAccount
};
