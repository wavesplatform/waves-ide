import * as notifications from "./actions";
import {ActionType, getType} from "typesafe-actions";

export type NotificationsAction = ActionType<typeof notifications>;

export default (value: string = '', action: NotificationsAction): string => {
    if (action.type == getType(notifications.userNotification)) {
        return action.payload
    }
    return value
}