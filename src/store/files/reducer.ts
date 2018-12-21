import {ActionType, getType} from 'typesafe-actions';
import * as filesActions from './actions'
const defaultState: IFilesState = [];

export enum FILE_TYPE {
    ASSET_SCRIPT = 'assetScript',
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

export type FilesAction = ActionType<typeof filesActions>;

export default (state: IFilesState = defaultState, action: FilesAction): IFilesState => {
    switch (action.type) {
        case getType(filesActions.newFile):

            return [...state, action.payload];
        case getType(filesActions.deleteFile):
            const dIndex = state.findIndex(file => file.id === action.payload.id);
            if (dIndex == null) return state;
            return [
                ...state.slice(0, dIndex),
                ...state.slice(dIndex + 1)
            ];
        case getType(filesActions.fileContentChange):
            const cIndex = state.findIndex(file => file.id === action.payload.id);
            return [
                ...state.slice(0, cIndex),
                {...state[cIndex], content: action.payload.content},
                ...state.slice(cIndex + 1)
            ];
        case getType(filesActions.renameFile):
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

