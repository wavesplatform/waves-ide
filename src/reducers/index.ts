import {combineReducers} from "redux";
import {coding} from './coding'
import {settings} from "./settings";
import {notifications} from "./notification";
import {wizard} from "./wizard";

export const rootReducer = combineReducers({
    coding,
    wizard,
    env: settings,
    snackMessage: notifications
})