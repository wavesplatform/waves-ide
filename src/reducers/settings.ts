import {ActionType, SettingsAction} from "../actions";

export const defaultSettings: ISettingsState = {
    SEED: 'industry unable prison quantum cram toast produce panda slow position coffee energy awesome route quarter',
    CHAIN_ID: 'T',
    API_BASE: 'https://testnodes.wavesnodes.com/'
}

export interface ISettingsState {
    SEED?: string,
    CHAIN_ID?: string,
    API_BASE?: string
}

export const settings = (state: ISettingsState = defaultSettings, action: SettingsAction): ISettingsState => {
    if (action.type == ActionType.SETTINGS_CHANGE) {
        const c: any = {...state};
        c[action.field] = action.value;
        return {...state, ...c}
    }
    return state
}