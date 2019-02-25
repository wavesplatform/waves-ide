import { connect, Dispatch } from 'react-redux';

import { RootAction, RootState } from '@store';

import { fileContentChange } from '@store/files/actions';

import Editor from './Editor';

const mapStateToProps = (state: RootState) => {
    const editor = state.editors.editors[state.editors.selectedEditor];

    if (!editor) return {id: '', code: '', language: ''};

    const file = state.files.find(file => file.id === editor.fileId);

    if (!file) return {id: '', code: '', language: ''};

    return {
        id: file.id,
        code: file.content,
        language: file.format
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onCodeChanged: (id: string, content: string) => {
        dispatch(fileContentChange({id, content}))
    }
});

export {
    mapStateToProps,
    mapDispatchToProps
};

export default (connect(mapStateToProps, mapDispatchToProps)(Editor));
