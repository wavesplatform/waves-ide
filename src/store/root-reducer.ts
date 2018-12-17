import {combineReducers} from 'redux';
import {StateType} from 'typesafe-actions';
import {editorsReducer} from './coding';
import {accountsReducer} from './accounts';
import {settingsReducer} from './settings';
import {notificationsReducer} from './notifications'
import {txEditorReducer} from './txEditor'
import {filesReducer} from './files'

const rootReducer = combineReducers({
    editors: editorsReducer,
    files: filesReducer,
    accounts: accountsReducer,
    settings: settingsReducer,
    snackMessage: notificationsReducer,
    txEditor: txEditorReducer
});

export type RootState = StateType<typeof rootReducer>;

export default rootReducer;