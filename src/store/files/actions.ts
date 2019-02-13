import {createStandardAction} from 'typesafe-actions';
import {FILE_TYPE, FILE_FORMAT} from "./reducer";

export const fileContentChange = createStandardAction('FILE_CONTENT_CHANGE')<{ id: string, content: string }>();
export const renameFile = createStandardAction('RENAME_FILE')<{ id: string, name: string }>();
export const deleteFile = createStandardAction('DELETE_FILE')<{ id: string }>();
export const newFile = createStandardAction('NEW_FILE')<{ id: string, content: string, type: FILE_TYPE,format: FILE_FORMAT, name: string }>();
export const createFile = createStandardAction('CREATE_FILE')<{type: FILE_TYPE, format: FILE_FORMAT, name?: string, content?: string}>();
