import {createStandardAction} from 'typesafe-actions';

//export const editorCodeChange = createStandardAction('EDITOR_CODE_CHANGE')<string>();
//export const renameEditorTab = createStandardAction('RENAME_EDITOR_TAB')<{ index: number, label: string }>();
export const selectEditorTab = createStandardAction('SELECT_EDITOR_TAB')<number>();
export const closeEditorTab = createStandardAction('CLOSE_EDITOR_TAB')<number>();
export const newEditorTab = createStandardAction('NEW_EDITOR_TAB')<{fileId:string}>();
