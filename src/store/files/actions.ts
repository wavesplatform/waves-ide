import {createStandardAction} from 'typesafe-actions';
import {FILE_TYPE} from "./reducer";

export const fileContentChange = createStandardAction('EDITOR_CODE_CHANGE')<{ id: string, content: string }>();
export const renameFile = createStandardAction('RENAME_EDITOR_TAB')<{ id: string, name: string }>();
export const deleteFile = createStandardAction('DELETE_FILE')<{ id: string }>();
export const newFile = createStandardAction('NEW_FILE')<{ content: string, type: FILE_TYPE, name?: string }>();
