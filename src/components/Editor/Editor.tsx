import React from "react";
import MonacoEditor from 'react-monaco-editor';
import ReactResizeDetector from "react-resize-detector";
import * as monaco from 'monaco-editor';
import {LspService} from 'ride-language-server/out/LspService';
import debounce from "debounce";

import {MonacoLspServiceAdapter} from "../../utils/MonacoLspServiceAdapter";

import {FILE_FORMAT} from "../../store/files/reducer";

import rideLanguageConfig from "./rideLanguageConfig"

import {IProps, IState} from './types';

const THEME_ID = 'wavesDefaultTheme';

class Editor extends React.Component<IProps, IState> {
    private editor: monaco.editor.ICodeEditor | null = null;
    private languageService = new MonacoLspServiceAdapter(new LspService());

    private editorWillMount = (m: typeof monaco) => {
        const {language} = this.props;

        // if (m.languages.getLanguages().every(x => x.id != language)) {
        if (language === FILE_FORMAT.RIDE) {

            m.languages.register({
                id: language
            });

            //m.languages.setLanguageConfiguration(language, {})
            m.languages.setLanguageConfiguration(language, {brackets: [['{', '}'], ['(', ')']]})
            m.languages.setMonarchTokensProvider(language, rideLanguageConfig)

            m.languages.registerCompletionItemProvider(language, {
                triggerCharacters: ['.', ':'],
                provideCompletionItems: this.languageService.completion.bind(this.languageService),
            });

            // m.editor.defineTheme(THEME_ID, {
            //     base: 'vs',
            //     colors: {},
            //     inherit: false,
            //     rules: [
            //         {token: 'keyword', foreground: '294F6D', fontStyle: 'bold'},
            //         {token: 'txTypes', foreground: '204F0D', fontStyle: 'bold'},
            //         {token: 'literal', foreground: '7ed619'},
            //         {token: 'string', foreground: '7ed619'},
            //         {token: 'comment', foreground: 'cccccc'}
            //     ]
            // })
        } else {
            m.languages.register({
                id: language
            });

            m.languages.setLanguageConfiguration(language, {})
        }
    };

    private onChange = (newValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        this.props.onCodeChanged(this.props.id, newValue);
        this.validateDocument()
    };

    private validateDocument = () => {
        // if (this.editor){
        //     const model = this.editor.getModel();
        //     if(model == null) return;
        //     const errors = this.languageService.validateTextDocument(model);
        //     monaco.editor.setModelMarkers(model, '' , errors)
        // };
    };

    private editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.validateDocument()
    };

    public render() {
        const {language, code} = this.props;

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
                        editorWillMount={this.editorWillMount}
                    />
                )}
            />
        );
    };
};

export default Editor;
