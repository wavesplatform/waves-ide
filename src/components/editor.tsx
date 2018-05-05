import * as React from "react";
import { render } from 'react-dom';
import { Store } from 'redux'
import MonacoEditor from 'react-monaco-editor';
import { IEditorState, IAppState } from "../state";
import { editorCodeChange } from "../store";
import ReactResizeDetector from "react-resize-detector";

const LANGUAGE_ID = 'waves';
const THEME_ID = 'wavesDefaultTheme'

export class Editor extends React.Component<{}, {
  editor?: monaco.editor.ICodeEditor,
  height: number,
  width: number,
  code: string,
}>
{
  unsubscribe

  constructor(props) {
    super(props)
    this.state = { height: 0, width: 0, code: '' }
    this.onResize = this.onResize.bind(this)
  }

  static contextTypes = {
    store: (): Error => null
  }

  editorWillMount(m: typeof monaco) {
    m.languages.register({
      id: LANGUAGE_ID,
      //   extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
      //   aliases: ['JSON', 'json'],
      //   mimetypes: ['application/json'],
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
          { regex: /[^\\']+/, action: { token: 'literal' } },
          { regex: /'/, action: { token: 'literal', bracket: '@close', next: '@pop' } }
        ],
        string: [
          { regex: /[^\\"]+/, action: { token: 'string' } },
          { regex: /"/, action: { token: 'string.quote', bracket: '@close', next: '@pop' } }
        ],

        // root: keywords.map(kv => ({ regex: new RegExp(`\\b${kv}\\b`), action: { token: 'keyword' } } as monaco.languages.IMonarchLanguageRule)).concat(
        //   [{ regex: /'[^']*?'/, action: { token: 'literal' } }]
        // ),
      }
    }
    language['keywords'] = keywords
    m.languages.setMonarchTokensProvider(LANGUAGE_ID, language)

    m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      provideCompletionItems: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> => {
        return keywords.map(label => ({ label, kind: monaco.languages.CompletionItemKind.Keyword } as monaco.languages.CompletionItem)).concat(
          [{
            label: 'ifelse',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: {
              value: 'if (${:condition}) then $1 else $0',
            },
          }]
        )
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

  editorDidMount(editor: monaco.editor.ICodeEditor, m: typeof monaco) {
    this.setState({ editor })
    this.unsubscribe = this.context.store.subscribe(() => {
      const newValue = this.context.store.getState().editor.code
      if (editor.getValue() != newValue)
        editor.setValue(newValue)
    })
  }

  onChange(newValue: string, e: monaco.editor.IModelContentChangedEvent) {
    this.setState({ code: newValue })
    this.context.store.dispatch(editorCodeChange(this.state.editor.getValue()))
  }

  onResize(width, height) {
    this.setState({ height, width });
  }

  componentDidMount() {
    const root = document.getElementById('editor_root')
    root.style.height = (window.outerHeight - root.getBoundingClientRect().top).toString() + 'px'
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  shouldComponentUpdate() {
    return !this.state.editor
  }

  render() {
    console.log("EDITOR RENDER")
    const options: monaco.editor.IEditorConstructionOptions = {
      selectOnLineNumbers: true,
      glyphMargin: true,
      language: LANGUAGE_ID,
      autoClosingBrackets: true,
      minimap: { enabled: false },
      contextmenu: false,
      renderLineHighlight: 'none',
      scrollBeyondLastLine: false,
      scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
      hideCursorInOverviewRuler: true,
      overviewRulerLanes: 0
    };

    return (
      <div id='editor_root' style={{ height: '100%', width: '100%', overflow: 'hidden', paddingTop: '6px' }}>
        <MonacoEditor
          width={this.state.width}
          height='100%'
          theme={THEME_ID}
          language={LANGUAGE_ID}
          value={this.state.code}
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

