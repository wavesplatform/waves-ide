import {ActionType, NotificationAction} from "../actions";

export const notifications = (value: string = '', action: NotificationAction): string => {
    if (action.type == ActionType.NOTIFY_USER) {
        return action.message
    }
    return value
}