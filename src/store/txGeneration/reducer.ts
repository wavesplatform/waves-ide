import {ActionType, getType} from 'typesafe-actions';
import * as txGeneration from './actions'

export const defaultState: ITxGenerationState = {
    txJson: '',
}

export interface ITxGenerationState {
    txJson: string
}

export type TxGenerationAction = ActionType<typeof txGeneration>;

export default (state: ITxGenerationState = defaultState, action: TxGenerationAction): ITxGenerationState => {
    if (action.type == getType(txGeneration.txGenerated)) {
        return {...state, txJson: action.payload}
    }
    return state
}