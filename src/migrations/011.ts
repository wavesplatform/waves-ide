export const VERSION = 11;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        accountsStore: {
            ...oldState.accountsStore,
            accountGroups: {
                ...oldState.accountsStore.accountGroups,
                S: oldState.accountsStore.accountGroups.S
                    ? oldState.accountsStore.accountGroups.S
                    : {
                        accounts: [],
                        activeAccountIndex: -1
                    }
            }
        }
    };

    return newState;
}
