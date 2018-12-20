import {IFilesState} from "./files";
import {FILE_TYPE, IFile} from "./files/reducer";
import {Dispatch, Store} from "redux";
import {RootState} from "./root-reducer";
import {RootAction} from "./root-action";
import {v4 as uuid} from "uuid";
import {filesActions} from "./files"
import {editorsActions} from "./editors";
import {getType} from "typesafe-actions";
import {createSelector} from "reselect";

function fileName(state: IFilesState, type: FILE_TYPE): string {
    let maxIndex = Math.max(...state.filter(file => file.type === type).map(n => n.name)
            .filter(l => l.startsWith(type))
            .map(x => parseInt(x.replace(type + '_', '')) || 0),
        0
    );
    return type + '_' + (maxIndex + 1)
}

export const fileManagerMW = (store: Store<RootState>) => (next: Dispatch<RootAction>) => (action: RootAction) => {
    const state = store.getState();
    if (action.type ===  getType(filesActions.createFile)){
        const file: IFile = {
            type: action.payload.type,
            id: uuid(),
            name: action.payload.name || fileName(state.files, action.payload.type),
            content: action.payload.content || ''
        };

        store.dispatch(filesActions.newFile(file));
        store.dispatch(editorsActions.newEditorTab({fileId: file.id}));
    }
    if( action.type === getType(filesActions.deleteFile)){
        const editorIndex = state.editors.editors.findIndex(editor => editor.fileId === action.payload.id);
        if (editorIndex > -1){
            store.dispatch(editorsActions.closeEditorTab(editorIndex))
        }
    }

    return next(action)
};

const getSelectedEditor = (state: RootState) => state.editors.selectedEditor;
const getEditors = (state: RootState) => state.editors.editors;
const getFiles = (state: RootState) => state.files;

export const getCurrentFile = createSelector(getSelectedEditor, getEditors, getFiles, (i, editors, files) => {
    const selectedEditor = editors[i];
    if(!selectedEditor) return;
    return files.find(file => file.id === selectedEditor.fileId)
})