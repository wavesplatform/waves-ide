import {combineReducers} from 'redux';
import {StateType} from 'typesafe-actions';
import {editorsReducer} from './editors';
import {accountsReducer} from './accounts';
import {settingsReducer} from './settings';
import {notificationsReducer} from './notifications'
import {txEditorReducer} from './txEditor'
import {filesReducer} from './files'
import examplesReducer from '../utils/getGitExamples/gitExamples.js'

const rootReducer = combineReducers({
    editors: editorsReducer,
    files: filesReducer,
    accounts: accountsReducer,
    settings: settingsReducer,
    snackMessage: notificationsReducer,
    txEditor: txEditorReducer,
    examples: examplesReducer
});

export type RootState = StateType<typeof rootReducer>;

export default rootReducer;