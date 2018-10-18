import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';
import { codingReducer } from './coding';
import { accountsReducer} from './accounts';
import {settingsReducer} from './settings';

const rootReducer = combineReducers({
    coding: codingReducer,
    accounts: accountsReducer,
    settings: settingsReducer
});

export type RootState = StateType<typeof rootReducer>;

export default rootReducer;