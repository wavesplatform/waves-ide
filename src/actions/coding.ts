import {ActionType} from "./index";
import {codeSamples} from "../samples";

interface EDITOR_CODE_CHANGE {
    type: ActionType.EDITOR_CODE_CHANGE
    code: string
}

interface NEW_EDITOR_TAB {
    type: ActionType.NEW_EDITOR_TAB
    code?: string,
    label?: string
}

interface RENAME_EDITOR_TAB {
    type: ActionType.RENAME_EDITOR_TAB
    index: number
    text: string
}

interface SELECT_EDITOR_TAB {
    type: ActionType.SELECT_EDITOR_TAB
    index: number
}
interface CLOSE_EDITOR_TAB {
    type: ActionType.CLOSE_EDITOR_TAB
    index: number
}

export type CodingAction = EDITOR_CODE_CHANGE | NEW_EDITOR_TAB | RENAME_EDITOR_TAB | SELECT_EDITOR_TAB | CLOSE_EDITOR_TAB

export const editorCodeChange = (code: string): EDITOR_CODE_CHANGE => ({
    type: ActionType.EDITOR_CODE_CHANGE,
    code
})

export const selectEditorTab = (index: number): SELECT_EDITOR_TAB => ({
    type: ActionType.SELECT_EDITOR_TAB,
    index
})

export const renameEditorTab = (index: number, text: string): RENAME_EDITOR_TAB => ({
    type: ActionType.RENAME_EDITOR_TAB,
    index,
    text
})

export const closeEditorTab = (index: number): CLOSE_EDITOR_TAB => ({
    type: ActionType.CLOSE_EDITOR_TAB,
    index
})

export const newEditorTab = (code?: string, label?: string): NEW_EDITOR_TAB => ({
    type: ActionType.NEW_EDITOR_TAB,
    code,
    label
})
export const loadSample = (id: 'simple' | 'notary' | 'multisig'): NEW_EDITOR_TAB => ({
    type: ActionType.NEW_EDITOR_TAB,
    code: codeSamples[id]
})