import {createStandardAction} from "typesafe-actions";

export const addAccount = createStandardAction('ADD_ACCOUNT')<string>();
export const removeAccount = createStandardAction('REMOVE_ACCOUNT')<number>();
export const setAccountSeed = createStandardAction('SET_ACCOUNT_SEED')<{seed:string, index: number}>();
export const setAccountLabel = createStandardAction('SET_ACCOUNT_LABEL')<{label:string, index:number}>();
export const selectAccount = createStandardAction('SELECT_ACCOUNT')<number>();