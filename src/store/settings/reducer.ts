import {ActionType, getType} from 'typesafe-actions';
import * as settings from './actions'

export const defaultState: ISettingsState = {
    chainId: 'T',
    apiBase: 'https://testnodes.wavesnodes.com/'
}

export interface ISettingsState {
    apiBase: string
    chainId: string
}

export type SettingsAction = ActionType<typeof settings>;

export default (state: ISettingsState = defaultState, action: SettingsAction): ISettingsState => {
    if (action.type == getType(settings.settingsChange)) {
        return {...state, ...action.payload}
    }
    return state
}