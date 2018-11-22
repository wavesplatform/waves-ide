import {ActionType, getType} from 'typesafe-actions';
import * as txEditor from './actions'

export const defaultState: ITxGenerationState = {
    txJson: '',
}

export interface ITxGenerationState {
    txJson: string
}

export type TxEditorAction = ActionType<typeof txEditor>;

export default (state: ITxGenerationState = defaultState, action: TxEditorAction): ITxGenerationState => {
    switch (action.type) {
        case getType(txEditor.txGenerated):
            return {...state, txJson: action.payload}
        case getType(txEditor.txChanged):
            return {...state, txJson: action.payload}
        default:
            return state
    }
}