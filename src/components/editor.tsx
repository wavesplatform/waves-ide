import * as React from "react";
import { render } from 'react-dom';
import MonacoEditor from 'react-monaco-editor';

export interface EditorProps {
  onChange?(code: string): void;
}
export interface EditorState {
  code: string
  editor?: monaco.editor.ICodeEditor
}

const LANGUAGE_ID = 'waves';
const THEME_ID = 'wavesDefaultTheme'
const MODEL_URI = 'inmemory://model.waves'

function resovleSchema(url: string): Promise<string> {
  const promise = new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.open("GET", url, true);
    xhr.send();
  });
  return promise;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
    }
  }

  editorWillMount(m: typeof monaco) {
    console.log('editorWillMount')
    m.languages.register({
      id: LANGUAGE_ID,
      //   extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
      //   aliases: ['JSON', 'json'],
      //   mimetypes: ['application/json'],
    });

    const keywords = ["let", "base58", "true", "false", "if", "then", "else"]

    m.languages.setMonarchTokensProvider(LANGUAGE_ID, {
      tokenPostfix: '.',
      tokenizer: {
        root: keywords.map(regex => ({ regex, action: { token: 'keyword' } } as monaco.languages.IMonarchLanguageRule)).concat(
          [{ regex: /'[^']*?'/, action: { token: 'literal' } }]
        ),
      }
    })

    m.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      provideCompletionItems: (model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> => {
        return keywords.map(label => ({ label, kind: monaco.languages.CompletionItemKind.Keyword } as monaco.languages.CompletionItem)).concat(
          [{
            label: 'ifelse',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: {
              value: [
                'if (${1:condition}) {',
                '\t$0',
                '} else {',
                '\t',
                '}'
              ].join('\n')
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
        { token: 'literal', foreground: '7ed619' }
      ]
    })
  }

  editorDidMount(editor: monaco.editor.ICodeEditor, m: typeof monaco) {
    this.setState({ editor })
    console.log('editorDidMount', editor)
  }

  onChange(newValue: string, e: monaco.editor.IModelContentChangedEvent) {
    if (this.props.onChange) {
      this.props.onChange(this.state.editor.getValue())
    }
  }

  render() {
    console.log('render');
    const code = this.state.code;
    const options: monaco.editor.IEditorConstructionOptions = {
      selectOnLineNumbers: true,
      glyphMargin: true,
      language: LANGUAGE_ID
    };
    return (
      <MonacoEditor
        width="100vw"
        height="600"
        theme={THEME_ID}
        language={LANGUAGE_ID}
        value={code}
        options={options}
        onChange={this.onChange.bind(this)}
        editorDidMount={this.editorDidMount.bind(this)}
        editorWillMount={this.editorWillMount.bind(this)}
      />
    );
  }
}