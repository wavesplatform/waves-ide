import {IFilesState} from "./files";
import {FILE_TYPE, IFile} from "./files/reducer";
import {Dispatch, Store} from "redux";
import {RootState} from "./root-reducer";
import {RootAction} from "./root-action";
import {v4 as uuid} from "uuid";
import {newFile} from "./files/actions";
import {newEditorTab} from "./editors/actions";

function fileName(state: IFilesState, type: FILE_TYPE): string {
    let maxIndex = Math.max(...state.filter(file => file.type === type).map(n => n.name)
            .filter(l => l.startsWith(type))
            .map(x => parseInt(x.replace(type, '')) || 0),
        0
    );
    return type + '_' + maxIndex + 1
}

export const fileCreateMW = (store: Store<RootState>) => (next: Dispatch<RootAction>) => (action: RootAction) => {
    if (action.type === 'CREATE_FILE'){
        const state = store.getState();
        const file: IFile = {
            type: action.payload.type,
            id: uuid(),
            name: action.payload.name || fileName(state.files, action.payload.type),
            content: action.payload.content || ''
        };

        store.dispatch(newFile(file));
        store.dispatch(newEditorTab({fileId: file.id}))
        return
    }else {
        return next(action)
    }
};