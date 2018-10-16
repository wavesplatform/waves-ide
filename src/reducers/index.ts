import {combineReducers} from "redux";
import {coding, ICodingState} from './coding'
import {settings, ISettingsState} from "./settings";
import {notifications} from "./notification";

export const rootReducer = combineReducers({
    coding,
    env: settings,
    snackMessage: notifications
})

export interface IAppState {
    coding: ICodingState
    env: ISettingsState,
    snackMessage: string
}