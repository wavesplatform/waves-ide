import {EditorsAction} from './coding';
import {AccountsAction} from "./accounts";
import {NotificationsAction} from "./notifications";
import {SettingsAction} from "./settings";
import {TxEditorAction} from "./txEditor";
import {FilesAction} from "./files";

export type RootAction =
    | FilesAction
    | EditorsAction
    | AccountsAction
    | NotificationsAction
    | SettingsAction
    | TxEditorAction