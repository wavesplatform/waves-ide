import {ActionType, getType} from 'typesafe-actions';
import * as editors from './actions'

const defaultState: IEditorsState = {
    selectedEditor: -1,
    editors: [],
}

export interface IEditorsState {
    selectedEditor: number
    editors: {fileId: string}[]
}

export type EditorsAction = ActionType<typeof editors>;

export default (state: IEditorsState = defaultState, action: EditorsAction): IEditorsState => {
    switch (action.type) {

        case getType(editors.closeEditorTab):
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, action.payload),
                    ...state.editors.slice(action.payload + 1)
                ],
                selectedEditor: action.payload >= state.editors.length - 1 ? state.editors.length - 2 : action.payload
            };

        case getType(editors.newEditorTab):
            return {...state, editors: [...state.editors, action.payload]}


        case getType(editors.selectEditorTab):
            return {
                ...state,
                selectedEditor: action.payload
            };

        default:
            return state
    }
}