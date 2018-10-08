import {ActionType, WizardAction} from "../actions";

const defaultWizardState: IWizardState = {
    open: false
}

export interface IWizardState {
    open: boolean
    kind?: string
}

export const wizard = (state: IWizardState = defaultWizardState, action: WizardAction): IWizardState => {
    switch (action.type) {
        case ActionType.OPEN_WIZARD:
            return { ...state, open: true, kind: action.kind}
        case ActionType.CLOSE_WIZARD:
            return {...state, open: false}
        case ActionType.CREATE_CONTRACT:
            break;
        default:
            return state
    }
}