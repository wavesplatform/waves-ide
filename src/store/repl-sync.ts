import {createSelector} from 'reselect';
import {Dispatch, Store} from "redux";
import {RootState} from "./root-reducer";

import {Repl} from "waves-repl";
import {RootAction} from "./root-action";

const getAccounts = (state: RootState) => state.accounts;
const getCoding = (state: RootState) => state.coding;
const getSettings = (state: RootState) => state.settings;

export const getReplState = createSelector(getAccounts, getSettings, getCoding, (accounts, settings, coding) => ({
    SEED: accounts.accounts[accounts.selectedAccount].seed,
    API_BASE: settings.apiBase,
    CHAIN_ID: settings.chainId,
    accounts: accounts.accounts.map(account => account.seed),
    ...coding
}))

export const syncEnvMiddleware = (store: Store<RootState>) => (next: Dispatch<RootAction>) => (action: RootAction) => {
    const nextAction = next(action);
    const state = store.getState(); // new state after action was applied

    Repl.updateEnv(getReplState(state));
    return nextAction;
};