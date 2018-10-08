import {combineReducers} from "redux";
import {coding} from './coding'
import {settings} from "./settings";
import {notifications} from "./notification";

export const rootReducer = combineReducers({
    coding,
    env: settings,
    snackMessage: notifications
})