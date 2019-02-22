import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import debounce from 'debounce';

import { languageService, THEME_ID } from '@src/setupMonaco';

import { IProps, IState } from './types';

class Editor extends React.Component<IProps, IState> {
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

    public render() {
        const { language, code } = this.props;

        const options: monaco.editor.IEditorConstructionOptions = {
            language: language,
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
                render={({ width, height }) => (
                    <MonacoEditor
                        width={width}
                        height={height}
                        theme={THEME_ID}
                        language={language}
                        value={code}
                        options={options}
                        onChange={debounce(this.onChange, 1000)}
                        editorDidMount={this.editorDidMount}
                    />
                )}
            />
        );
    };
};

export default Editor;
