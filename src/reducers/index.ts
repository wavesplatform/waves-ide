import {combineReducers} from "redux";
import {coding, ICodingState} from './coding'
import {settings, ISettingsState} from "./settings";
import {notifications} from "./notification";
import {wizard, IWizardState} from "./wizard";

export const rootReducer = combineReducers({
    coding,
    wizard,
    env: settings,
    snackMessage: notifications
})

export interface IAppState {
    coding: ICodingState
    wizard: IWizardState,
    env: ISettingsState,
    snackMessage: string
}