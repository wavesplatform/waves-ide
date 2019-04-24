import { observable, action, computed, reaction } from 'mobx';

import { generateMnemonic } from 'bip39';
import { libs } from '@waves/waves-transactions';

const { privateKey, publicKey, address } = libs.crypto;

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

interface IAccountProps {
    seed: string
    label: string
    chainId: string
}

interface IAccount extends IAccountProps {
    address: string
    publicKey: string
    privateKey: string
}

interface IAccountGroup {
    accounts: IAccount[],
    activeAccountIndex: number
}

const accountObs = (account: IAccountProps): IAccount => {
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
};

class AccountsStore extends SubStore {
    @observable accountGroups: Record<string, IAccountGroup> = {
        'W': {
            accounts: [],
            activeAccountIndex: -1
        },
        'T': {
            accounts: [],
            activeAccountIndex: -1
        }
    };

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            this.accountGroups = this.deserialize(initState);
        }

        this.newChainIdReaction();
    }

    public serialize = () => ({
        accountGroups: this.accountGroups
    });

    public deserialize = (initState: any) => {
        return Object.entries(initState.accountGroups as Record<string, IAccountGroup>)
            .reduce((accountGroup, [chainId, {activeAccountIndex, accounts}]) => ({
                ...accountGroup,
                [chainId]: {
                    activeAccountIndex,
                    accounts: accounts.map(account => accountObs(account))
                }
            }), {} as Record<string, IAccountGroup>);
    };

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

    set activeAccountIndex(i) {
        this.activeChainIdAccountGroup.activeAccountIndex = i;
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
            this.activeAccountIndex = 0;
        }
    }

    @action
    deleteAccount(i: number) {
        this.accounts.splice(i, 1);
        if (this.activeAccountIndex >= i) this.activeAccountIndex -= 1;
        if (this.activeAccountIndex < 0) this.activeAccountIndex = 0;
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
    generateAccount(label?: string, seed?: string) {
        let maxLabel = Math.max(0, ...this.accounts.map(account => {
            const match = account.label.match(/Account (\d+)/);
            if (match != null) return parseInt(match[1]);
            else return 0;
        }));

        const newAccount = accountObs({
            seed: seed ? seed : generateMnemonic(),
            label: label ? label : `Account ${maxLabel + 1}`,
            chainId: this.rootStore.settingsStore.defaultChainId
        });

        this.addAccount(newAccount);
    }
}

export {
    AccountsStore,
    IAccount,
};
