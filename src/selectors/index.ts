import { createSelector } from 'reselect';
import { RootState } from '@store/root-reducer';

const getAccounts = (state: RootState) => state.accounts;

const selectAccounts = createSelector(getAccounts, accounts => ({
    accounts: accounts.accounts.map(account => account.seed)
}));

export {
    selectAccounts
};
