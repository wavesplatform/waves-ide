export const VERSION = 3;

let createAccountGroups = (oldState: any, chainId: string) => {
    const oldAccounts = oldState.accountsStore.accounts;

    const hasAccounts = oldAccounts.length > 0;

    const newAccounts = hasAccounts
        ? oldAccounts.map((account: any) => ({ chainId, ...account }))
        : [];

    const activeAccountIndex = hasAccounts
        ? oldState.accountsStore.defaultAccountIndex
        : -1;

    return {
       accounts: newAccounts,
       activeAccountIndex: activeAccountIndex
    };
};

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        accountsStore: {
            accountGroups: {
                'W': createAccountGroups(oldState, 'W'),
                'T': createAccountGroups(oldState, 'T'),
            }
        }
    };

    return newState;
}
