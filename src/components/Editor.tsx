import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { RootAction, RootState } from '../store';
import { fileContentChange } from '../store/files/actions';
import ReactResizeDetector from 'react-resize-detector';
import { languageService, LANGUAGE_ID, THEME_ID } from '../setupMonaco';
import debounce from 'debounce';


const mapStateToProps = (state: RootState) => {
    const editor = state.editors.editors[state.editors.selectedEditor];
    if (!editor) return {code: '', id: ''};
    const file = state.files.find(file => file.id === editor.fileId);
    if (!file) return {code: '', id: ''};
    return {code: file.content, id: file.id};
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onCodeChanged: (id: string, content: string) => {
        dispatch(fileContentChange({id, content}));
    }
});

interface IEditorProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {

}

class EditorComponent extends Component<IEditorProps> {

    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;


    onChange = (newValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        this.props.onCodeChanged(this.props.id, newValue);
        this.validateDocument();
    };

    validateDocument = () => {
        if (this.editor && this.monaco) {
            const model = this.editor.getModel();
            if (model == null) return;
            const errors = languageService.validateTextDocument(model);
            this.monaco.editor.setModelMarkers(model, '', errors);
        }
    };

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;
        this.validateDocument();
    };


    render() {
        const options: monaco.editor.IEditorConstructionOptions = {
            language: LANGUAGE_ID,
            selectOnLineNumbers: true,
            glyphMargin: false,
            autoClosingBrackets: 'always',
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            scrollbar: {vertical: 'hidden', horizontal: 'hidden'},
            // hideCursorInOverviewRuler: true,
            overviewRulerLanes: 0,
            wordBasedSuggestions: true,
            acceptSuggestionOnEnter: 'on'
        };

        return (
            <ReactResizeDetector
                handleWidth
                handleHeight
                render={({width, height}) => (
                    <MonacoEditor
                        width={width}
                        height={height}
                        theme={THEME_ID}
                        language={LANGUAGE_ID}
                        value={this.props.code}
                        options={options}
                        onChange={debounce(this.onChange, 1000)}
                        editorDidMount={this.editorDidMount}
                        //editorWillMount={this.editorWillMount}
                    />
                )}
            />

        );
    }
}


export const Editor = connect(mapStateToProps, mapDispatchToProps)(EditorComponent);
