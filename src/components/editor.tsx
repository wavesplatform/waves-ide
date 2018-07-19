import * as React from "react";
import { connect } from 'react-redux'
import MonacoEditor from 'react-monaco-editor';
import { IAppState, getCurrentEditor } from "../state";
import { txFields, generalSuggestions, cryptoFunctions, contextFunctions, contextFields, txTypes } from "./lang/suggestions";
import { editorCodeChange } from "../store";
import ReactResizeDetector from "react-resize-detector";
import { config } from "../config"

const LANGUAGE_ID = 'waves';
const THEME_ID = 'wavesDefaultTheme'

interface ParameterInformation {
  /**
   * The label of this signature. Will be shown in
   * the UI.
   */
  label: string;
  /**
   * The human-readable doc-comment of this signature. Will be shown
   * in the UI but can be omitted.
   */
  documentation?: string;
}

interface SignatureHelp {
  /**
   * One or more signatures.
   */
  signatures: {
    /**
     * The label of this signature. Will be shown in
     * the UI.
     */
    label: string;
    /**
     * The human-readable doc-comment of this signature. Will be shown
     * in the UI but can be omitted.
     */
    documentation?: string;
    /**
     * The parameters of this signature.
     */
    parameters: ParameterInformation[];
  }[];
  /**
   * The active signature.
   */
  activeSignature: number;
  /**
   * The active parameter of the active signature.
   */
  activeParameter: number;
}

export class editor extends React.Component<{
  code: string
  error: string
  onCodeChanged: (code: string) => void
}>
{
  width: number
  height: number
  editor: monaco.editor.ICodeEditor

  constructor(props) {
    super(props)
    this.state = { height: 0, width: 0, code: '' }
    this.onResize = this.onResize.bind(this)
  }

  editorWillMount(m: typeof monaco) {
    if (m.languages.getLanguages().every(x => x.id != LANGUAGE_ID)) {

      m.languages.register({
        id: LANGUAGE_ID,
      });

      const keywords = ["let", "true", "false", "if", "then", "else"]

      const language = {
        tokenPostfix: '.',
        tokenizer: {
          root: [
            { regex: /base58'/, action: { token: 'literal', bracket: '@open', next: '@literal' } },
            {
              regex: /[a-z_$][\w$]*/, action: {
                cases: {
                  '@keywords': 'keyword'
                }
              }
            },
            { regex: /"([^"\\]|\\.)*$/, action: { token: 'string.invalid' } },
            { regex: /"/, action: { token: 'string.quote', bracket: '@open', next: '@string' } },
          ],
          literal: [
            { regex: /[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/, action: { token: 'literal' } },
            { regex: /'/, action: { token: 'literal', bracket: '@close', next: '@pop' } }
          ],
          string: [
            { regex: /[^\\"]+/, action: { token: 'string' } },
            { regex: /"/, action: { token: 'string.quote', bracket: '@close', next: '@pop' } }
          ],
        }
      }

      const suggestions = keywords.map(label => ({ label, kind: monaco.languages.CompletionItemKind.Keyword } as monaco.languages.CompletionItem))
        .concat(generalSuggestions(monaco.languages.CompletionItemKind.Snippet))
        .concat(cryptoFunctions(monaco.languages.CompletionItemKind.Function))
        .concat(contextFunctions(monaco.languages.CompletionItemKind.Function))
        .concat(contextFields(monaco.languages.CompletionItemKind.Field))

      language['keywords'] = keywords
      m.languages.setMonarchTokensProvider(LANGUAGE_ID, language)
      // m.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
      //   signatureHelpTriggerCharacters: ['(', ','],
      //   provideSignatureHelp: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): SignatureHelp => {
      //     return {
      //       activeParameter: 0, activeSignature: 0, signatures: [{
      //         label: "foo", parameters: [
      //           { label: "param", documentation: "blah" }
      //         ]
      //       }]
      //     }
      //   },
      // })

      m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: ['.'],
        provideCompletionItems: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> => {
          const p = model.getLineContent(position.lineNumber).substr(position.column - 4, 3)
          if (p == 'tx.')
            return {
              isIncomplete: false, items: txFields.map(label => ({
                label, kind: monaco.languages.CompletionItemKind.Field
              }))
            }
          return undefined
        },
      })

      m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: [':'],
        provideCompletionItems: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> => {
          const p = model.getLineContent(position.lineNumber).substr(position.column - 2, 1)
          if (p == ':')
            return {
              isIncomplete: false, items: txTypes.map(label => ({
                label, kind: monaco.languages.CompletionItemKind.Interface
              }))
            }
          return undefined
        },
      })

      m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        provideCompletionItems: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> => {
          const p = model.getLineContent(position.lineNumber).substr(position.column - 3, 3)
          return { isIncomplete: false, items: suggestions }
        },
      })

      m.editor.defineTheme(THEME_ID, {
        base: 'vs',
        colors: {},
        inherit: false,
        rules: [
          { token: 'keyword', foreground: '294F6D', fontStyle: 'bold' },
          { token: 'literal', foreground: '7ed619' },
          { token: 'string', foreground: '7ed619' }
        ]
      })
    }
  }

  onChange(newValue: string, e: monaco.editor.IModelContentChangedEvent) {
    this.props.onCodeChanged(newValue)
  }

  onResize(w, h) {
    this.width = w
    this.height = h
    this.forceUpdate()
  }

  componentDidMount() {
    const root = document.getElementById('editor_root')
    root.style.height = (window.outerHeight - root.getBoundingClientRect().top - config.replHeight).toString() + 'px'
  }

  editorDidMount(e: monaco.editor.ICodeEditor, m: typeof monaco) {
    this.editor = e
  }

  shouldComponentUpdate(props) {

    try {
      if (this.editor) {
        monaco.editor.setModelMarkers(this.editor.getModel(), null, [])
        if (props.error && props.error.length > 0) {
          const errRgxp = /\d+-\d+/gm
          const r: string = props.error
          const model = this.editor.getModel()
          const errors = errRgxp.exec(r).map(offsets => {
            const [start, end] = offsets.split('-')
            const s = model.getPositionAt(parseInt(start))
            const e = model.getPositionAt(parseInt(end))
            return {
              severity: monaco.Severity.Error,
              startLineNumber: s.lineNumber,
              startColumn: s.column,
              endLineNumber: e.lineNumber,
              endColumn: e.column,
              message: props.error
            }
          })
          monaco.editor.setModelMarkers(this.editor.getModel(), null, errors)
        }
      }
    }
    catch { }

    if (this.editor && this.editor.getValue() == props.code)
      return false
    return true
  }

  render() {
    const options: monaco.editor.IEditorConstructionOptions = {
      language: LANGUAGE_ID,
      selectOnLineNumbers: true,
      glyphMargin: true,
      autoClosingBrackets: true,
      minimap: { enabled: false },
      contextmenu: false,
      renderLineHighlight: 'none',
      scrollBeyondLastLine: false,
      scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
      hideCursorInOverviewRuler: true,
      overviewRulerLanes: 0,
      wordBasedSuggestions: true,
      acceptSuggestionOnEnter: 'on'
    };

    console.log("EDITOR RENDER")
    return (
      <div id='editor_root' style={{ height: '100%', width: '100%', overflow: 'hidden', paddingTop: '6px' }}>
        <MonacoEditor
          width={this.width}
          height='100%'
          theme={THEME_ID}
          language={LANGUAGE_ID}
          value={this.props.code}
          options={options}
          onChange={this.onChange.bind(this)}
          editorDidMount={this.editorDidMount.bind(this)}
          editorWillMount={this.editorWillMount.bind(this)}
        />
        <ReactResizeDetector handleWidth={true} handleHeight={true} onResize={this.onResize.bind(this)} />
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState) => {
  const editor = getCurrentEditor(state.coding)
  if (!editor) return { code: '' }
  const error = editor.compilationResult ? (editor.compilationResult as any).error : undefined
  return { code: (editor || { code: '' }).code, error }
}

const mapDispatchToProps = (dispatch) => ({
  onCodeChanged: (code: string) => {
    dispatch(editorCodeChange(code))
  }
})

export const Editor = connect(mapStateToProps, mapDispatchToProps)(editor)
