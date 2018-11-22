import {CodingAction} from './coding';
import {AccountsAction} from "./accounts";
import {NotificationsAction} from "./notifications";
import {SettingsAction} from "./settings";
import {TxEditorAction} from "./txEditor";

export type RootAction =
    CodingAction |
    AccountsAction |
    NotificationsAction |
    SettingsAction |
    TxEditorAction