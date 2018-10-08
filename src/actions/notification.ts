import {ActionType} from "./index";

interface NOTIFY_USER {
    type: ActionType.NOTIFY_USER
    message: string
}

export type NotificationAction = NOTIFY_USER

export const notifyUser = (message: string): NOTIFY_USER => ({
    type: ActionType.NOTIFY_USER,
    message
})