import {ActionType} from "./index";

interface SETTINGS_CHANGE {
    type: ActionType.SETTINGS_CHANGE
    field: string,
    value: string
}

export type SettingsAction = SETTINGS_CHANGE

export const settingsChange = (field: string, value: string): SETTINGS_CHANGE => ({
    type: ActionType.SETTINGS_CHANGE,
    field,
    value
})