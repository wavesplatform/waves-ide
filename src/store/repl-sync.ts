import {createSelector} from 'reselect';
import {Dispatch, Store} from "redux";
import {RootState} from "./root-reducer";

import {Repl as WavesRepl} from "waves-repl";
import {RootAction} from "./root-action";

const getAccounts = (state: RootState) => state.accounts;
const getSettings = (state: RootState) => state.settings;

export const selectReplState = createSelector(getAccounts, getSettings, (accounts, settings) => ({
    SEED: accounts.accounts[accounts.selectedAccount].seed,
    API_BASE: settings.apiBase,
    CHAIN_ID: settings.chainId,
    accounts: accounts.accounts.map(account => account.seed),
}))

export const syncEnvMW = (store: Store<RootState>) => (next: Dispatch<RootAction>) => (action: RootAction) => {
    const nextAction = next(action);
    const state = store.getState(); // new state after action was applied

    WavesRepl.updateEnv(selectReplState(state));
    return nextAction;
};