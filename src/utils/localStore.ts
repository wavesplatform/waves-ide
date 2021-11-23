export const loadState = (): any | undefined => {
    try {
        const state = JSON.parse(localStorage.getItem('store') as string);
        const accountGroups = state.accountsStore.accountGroups;
        const emptyChainId = '';
        if (accountGroups[emptyChainId]) {
            if (accountGroups[emptyChainId].accounts.length) {
                state.accountsStore.accountGroups['T'].accounts.push(...accountGroups[emptyChainId].accounts);
                delete state.accountsStore.accountGroups[''];
            } else delete state.accountsStore.accountGroups[''];
            localStorage.setItem('store', JSON.stringify(state))
        }
        return state || undefined;

    } catch (error) {
        console.log(error);
        return undefined;
    }

};
export const saveState = (state: any): void => {
    localStorage.setItem('store', JSON.stringify(state));
};
