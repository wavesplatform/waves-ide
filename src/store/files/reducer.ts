import {ActionType, getType} from 'typesafe-actions';
import * as files from './actions'
import {v4 as uuid} from 'uuid'
const defaultState: IFilesState = [];

export enum FILE_TYPE {
    TOKEN_SCRIPT = 'tokenScript',
    ACCOUNT_SCRIPT = 'accountScript',
    CONTRACT = 'contract',
    TEST = 'test'
}

export interface IFile {
    type: FILE_TYPE;
    id: string
    name: string;
    content: string;
}

export type IFilesState = IFile[]

export type FilesAction = ActionType<typeof files>;

export default (state: IFilesState = defaultState, action: FilesAction): IFilesState => {
    switch (action.type) {
        case getType(files.newFile):
            const file: IFile = {
                type: action.payload.type,
                id: uuid(),
                name: action.payload.name || fileName(state, action.payload.type),
                content: action.payload.content
            };
            return [...state, file];
        case getType(files.deleteFile):
            const dIndex = state.findIndex(file => file.id === action.payload.id);
            if (dIndex == null) return state;
            return [
                ...state.slice(0, dIndex),
                ...state.slice(dIndex + 1)
            ];
        case getType(files.fileContentChange):
            const cIndex = state.findIndex(file => file.id === action.payload.id);
            return [
                ...state.slice(0, cIndex),
                {...state[cIndex], content: action.payload.content},
                ...state.slice(cIndex + 1)
            ];
        case getType(files.renameFile):
            const rIndex = state.findIndex(file => file.id === action.payload.id);
            return [
                ...state.slice(0, rIndex),
                {...state[rIndex], name: action.payload.name},
                ...state.slice(rIndex + 1)
            ];
        default:
            return state
    }
}

function fileName(state: IFilesState, type: FILE_TYPE): string {
    let maxIndex = Math.max(...state.filter(file => file.type === type).map(n => n.name)
            .filter(l => l.startsWith(type))
            .map(x => parseInt(x.replace(type, '')) || 0),
        0
    );
    return type + '_' + maxIndex + 1
}