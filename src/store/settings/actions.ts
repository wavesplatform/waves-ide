import {createStandardAction} from 'typesafe-actions';
import {ISettingsState} from "./reducer";

export const settingsChange = createStandardAction('SETTINGS_CHANGE')<Partial<ISettingsState>>();

