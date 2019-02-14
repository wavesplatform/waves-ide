import React, {Component} from "react";
import {connect, Dispatch} from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import {RootAction, RootState} from "../store";
import {fileContentChange} from "../store/files/actions";
import ReactResizeDetector from "react-resize-detector";
import {LspService} from 'ride-language-server/out/LspService';
import {MonacoLspServiceAdapter} from "../utils/MonacoLspServiceAdapter";
import {txTypes} from 'ride-language-server/out/suggestions';
import debounce from "debounce";

const LANGUAGE_ID = 'ride';
const THEME_ID = 'wavesDefaultTheme';

const mapStateToProps = (state: RootState) => {
    const editor = state.editors.editors[state.editors.selectedEditor];
    if (!editor) return {code: '', id: ''};
    const file = state.files.find(file => file.id === editor.fileId);
    if (!file) return {code: '', id: ''};
    return {code: file.content, id: file.id}
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onCodeChanged: (id: string, content: string) => {
        dispatch(fileContentChange({id, content}))
    }
})

interface IEditorProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {

}

class EditorComponent extends Component<IEditorProps> {

    editor: monaco.editor.ICodeEditor | null = null;
    languageService = new MonacoLspServiceAdapter(new LspService());

    editorWillMount = (m: typeof monaco) => {
        if (m.languages.getLanguages().every(x => x.id != LANGUAGE_ID)) {

            m.languages.register({
                id: LANGUAGE_ID,
            });


            const TransferFields = [
                'recipient',
                'amount',
            ]


            const keywords = ["let", "true", "false", "if", "then", "else", "match", "case", "base58"]

            const language = {
                tokenPostfix: '.',
                tokenizer: {
                    root: [
                        {
                            action: {token: 'types'},
                            regex: /\bTransferTransaction|IssueTransaction|ReissueTransaction|BurnTransaction|LeaseTransaction|LeaseCancelTransaction|MassTransferTransaction|CreateAliasTransaction|SetScriptTransaction|SponsorFeeTransaction|ExchangeTransaction|DataTransaction|SetAssetScriptTransaction\b/
                        },
                        {
                            action: {token: 'typesItalic'},
                            regex: /\bAddress|Alias|Transfer|Order|DataEntry|GenesisTransaction|PaymentTransaction\b/
                        },
                        {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base58literal'}},
                        {regex: /'/, action: {token: 'literal', bracket: '@open', next: '@base64literal'}},
                        {include: '@whitespace'},
                        {regex: /[a-z_$][\w$]*/, action: {cases: {'@keywords': 'keyword'}}},
                        {regex: /ExchangeTransaction/, action: {token: 'intr'}},
                        {regex: /"([^"\\]|\\.)*$/, action: {token: 'string.invalid'}},
                        {regex: /"/, action: {token: 'string.quote', bracket: '@open', next: '@string'}},

                        // numbers
                        {regex: /\d*\.\d+([eE][\-+]?\d+)?/, action: {token: 'number.float'}},//number.float
                        {regex: /[0-9_]+/, action: {token: 'number'}},//number


                    ],
                    whitespace: [
                        //{ regex: /^[ \t\v\f]*#\w.*$/, action: { token: 'namespace.cpp' } },
                        {regex: /[ \t\v\f\r\n]+/, action: {token: 'white'}},
                        //{ regex: /\/\*/, action: { token: 'comment', next: '@comment' } },
                        {regex: /#.*$/, action: {token: 'comment'}},
                    ],
                    base58literal: [
                        {
                            regex: /[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/,
                            action: {token: 'literal'}
                        },
                        {regex: /'/, action: {token: 'literal', bracket: '@close', next: '@pop'}}
                    ],
                    base64literal: [
                        {
                            regex: /[[A-Za-z0-9+/=]+/,
                            action: {token: 'literal'}
                        },
                        {regex: /'/, action: {token: 'literal', bracket: '@close', next: '@pop'}}
                    ],
                    string: [
                        {regex: /[^\\"]+/, action: {token: 'string'}},
                        {regex: /"/, action: {token: 'string.quote', bracket: '@close', next: '@pop'}}
                    ]
                },
                keywords, txTypes
            }

            //m.languages.setLanguageConfiguration(LANGUAGE_ID, {})
            m.languages.setLanguageConfiguration(LANGUAGE_ID, {brackets: [['{', '}'], ['(', ')']]})
            m.languages.setMonarchTokensProvider(LANGUAGE_ID, language)

            m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
                triggerCharacters: ['.', ':'],
                provideCompletionItems: this.languageService.completion.bind(this.languageService),
            })

            m.editor.defineTheme(THEME_ID, {
                base: 'vs',
                colors: {},
                inherit: true,
                rules: [
                    {token: 'keyword', foreground: '0000ff'},
                    {token: 'string', foreground: 'a31415'},
                    //{token: 'number', foreground: '8e5c94'},
                    {token: 'typesItalic', foreground: '4990ad', fontStyle: 'italic'},
                    {token: 'types', foreground: '4990ad'},
                    {token: 'literal', foreground: 'a31415', fontStyle: 'italic'},
                    // {token: 'comment', foreground: '757575'}
                ]
            })
        }
    }

    onChange = (newValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        this.props.onCodeChanged(this.props.id, newValue);
        this.validateDocument()
    }

    validateDocument = () => {
        if (this.editor) {
            const model = this.editor.getModel();
            if (model == null) return;
            const errors = this.languageService.validateTextDocument(model);
            monaco.editor.setModelMarkers(model, '', errors)
        }
    }

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.validateDocument()
    }


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
                        editorWillMount={this.editorWillMount}
                    />
                )}
            />

        );
    }
}


export const Editor = connect(mapStateToProps, mapDispatchToProps)(EditorComponent);
