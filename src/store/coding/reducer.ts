import {ActionType, getType} from 'typesafe-actions';
import {safeCompile, ICompilationResult} from "../../utils/safeCompile";
import * as coding from './actions'

const defaultState: ICodingState = {
    selectedEditor: -1,
    editors: [],
}

export interface ICodingState {
    selectedEditor: number
    editors: IEditorState[]
}

interface IEditorState {
    label: string,
    code: string
    compilationResult?: ICompilationResult
}

export type CodingAction = ActionType<typeof coding>;

export default (state: ICodingState = defaultState, action: CodingAction): ICodingState => {
    switch (action.type) {
        case getType(coding.editorCodeChange):
            const i = state.selectedEditor;
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, i),
                    {...state.editors[i], code: action.payload,compilationResult: safeCompile(action.payload)},
                    ...state.editors.slice(i + 1)
                ]
            };

        case getType(coding.closeEditorTab):
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, action.payload),
                    ...state.editors.slice(action.payload + 1)
                ],
                selectedEditor: action.payload >= state.editors.length - 1 ? state.editors.length - 2 : action.payload
            };

        case getType(coding.newEditorTab):
            const BASE_LABEL = 'script_';
            const maxIndex = () => Math.max(...state.editors.map(n => n.label)
                        .filter(l => l.startsWith(BASE_LABEL))
                        .map(x => parseInt(x.replace(BASE_LABEL, '')) || 0),
                    0
                );
            return {
                ...state,
                editors: state.editors.concat({
                    label: action.payload.label || BASE_LABEL + (maxIndex() + 1),
                    code: action.payload.code,
                    compilationResult: safeCompile(action.payload.code)
                }),
                selectedEditor: state.editors.length
            };

        case getType(coding.renameEditorTab):
            const {label, index} = action.payload
            return {
                ...state,
                editors: [
                    ...state.editors.slice(0, index),
                    {...state.editors[index], label},
                    ...state.editors.slice(index + 1)
                ]
            };

        case getType(coding.selectEditorTab):
            return {
                ...state,
                selectedEditor: action.payload
            };

        default:
            return state
    }
}