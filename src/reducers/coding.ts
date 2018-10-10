import {ActionType, CodingAction} from "../actions";
import {safeCompile, ICompilationResult} from "../utils/safeCompile";

const defaultCodingState: ICodingState = {
    editors: [],
}

export interface ICodingState {
    selectedEditor?: number
    editors: IEditorState[]
}

interface IEditorState {
    label: string,
    code: string
    compilationResult?: ICompilationResult
}

export const coding = (state: ICodingState = defaultCodingState, action: CodingAction): ICodingState => {
    let editors;
    switch (action.type) {
        case ActionType.EDITOR_CODE_CHANGE:
            editors = state.editors.map((e: IEditorState, i): IEditorState => {
                if (i !== state.selectedEditor)
                    return e;
                return {
                    ...e,
                    code: action.code,
                    compilationResult: safeCompile(action.code)
                }
            });
            return {...state, editors};

        case ActionType.CLOSE_EDITOR_TAB:
            editors = [
                ...state.editors.slice(0, action.index),
                ...state.editors.slice(action.index + 1)
            ];

            let selectedEditor = action.index >= editors.length ? editors.length - 1 : action.index

            return {...state, editors, selectedEditor};

        case ActionType.NEW_EDITOR_TAB:
            const indexes = state.editors.map(n => n.label)
                .filter(l => l.startsWith('undefined_'))
                .map(x => parseInt(x.replace('undefined_', '')))
                .sort()
            const newIndex = 1 + (indexes[indexes.length - 1] || 0);

            return {
                ...state, editors: [
                    ...state.editors,
                    {
                        label: action.label || ('undefined_' + newIndex),
                        code: action.code,
                        compilationResult: safeCompile(action.code)
                    },
                ],
                selectedEditor: state.editors.length
            };

        case ActionType.RENAME_EDITOR_TAB:
            editors = state.editors.map((e: IEditorState, i): IEditorState => {
                if (i != action.index)
                    return e

                return {
                    ...e,
                    label: action.text
                }
            });
            return {...state, editors};

        case ActionType.SELECT_EDITOR_TAB:
            return {...state, selectedEditor: action.index}

        default:
            return state
    }
}