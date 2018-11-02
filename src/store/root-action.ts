import {CodingAction} from './coding';
import {AccountsAction} from "./accounts";
import {NotificationsAction} from "./notifications";
import {SettingsAction} from "./settings";
import {TxGenerationAction} from "./txGeneration";

export type RootAction =
    CodingAction |
    AccountsAction |
    NotificationsAction |
    SettingsAction |
    TxGenerationAction