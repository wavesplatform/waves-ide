import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import keycodes from '../lib/keycodes';
import { wavesDocs } from '../../../waves-docs';

class Input extends Component {
  constructor(props) {
    super(props);
    this.input = null;
    this.monaco = null;
    // history is set in the componentDidMount
    this.state = {
      value: props.value || '',
      multiline: false,
      rows: 1,
      historyCursor: props.history.length,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.editorDidMount = this.editorDidMount.bind(this);
  }

  onChange() {
    const value = this.input.__current_value || this.input.value || '';
    const length = value.split('\n').length;
    this.setState({
      multiline: length > 1,
      rows: length < 20 ? length : 20,
      value,
    });
  }

  async onKeyPress(e) {
    const value = this.input.__current_value || this.input.value || '';
    const code = keycodes[e.browserEvent.keyCode];
    const { multiline } = this.state;
    const { history } = this.props;
    let { historyCursor } = this.state;

    try {
      const isIntelisenceHidden = window.document.getElementsByClassName('tree').item(0).style['display'] == 'none';
      if (!isIntelisenceHidden)
        return;
    } catch (e) { }

    // if (e.keyCode == 87) {
    //   setTimeout(() => {
    //     this.input.editor.trigger('', 'editor.action.triggerSuggest', {});
    //   }, 100)
    //   return;
    // }

    // FIXME in multiline, cursor up when we're at the top
    // const cursor = getCursor(this.input);
    if (e.ctrlKey && code === 'l') {
      this.props.onClear();
      return;
    }

    if (!multiline) {
      if (code === 'up arrow') {
        historyCursor--;
        if (historyCursor < 0) {
          this.setState({ historyCursor: 0 });
          return;
        }
        this.setState({ historyCursor, value: history[historyCursor] });
        e.preventDefault();
        return;
      }

      if (code === 'down arrow') {
        historyCursor++;
        if (historyCursor >= history.length) {
          this.setState({ historyCursor: history.length, value: '' });
          return;
        }
        this.setState({ historyCursor, value: history[historyCursor] });
        e.preventDefault();
        return;
      }
    }

    const command = value;
    if (code === 'enter') {
      if (e.shiftKey) {
        return;
      }

      if (!command) {
        e.preventDefault();
        return;
      }

      this.monaco.languages.typescript.typescriptDefaults.addExtraLib(command);

      this.props.addHistory(command);
      this.setState({ historyCursor: history.length + 1, value: '' });
      e.preventDefault();
      await this.props.onRun(command);

      document.getElementById('repl').scrollBy(0, 1000);
      return;
    }
  }

  editorDidMount(editor, monaco) {
    this.input = editor;
    this.monaco = monaco;
    editor.onKeyDown((e) => { this.onKeyPress(e); });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
      target: monaco.languages.typescript.ScriptTarget.ES6
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(wavesDocs);
    editor.focus();
  }

  render() {
    const { autoFocus } = this.props;
    return (

      <div className="Input" style={{ overflowX: 'hidden', height: '40px' }}>
        <MonacoEditor
          language="typescript"
          value={this.state.value}
          height={30}
          ref={e => {
            this.input = e;
            this.props.inputRef(e);
          }}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
          options={{
            language: 'typescript',
            selectOnLineNumbers: false,
            glyphMargin: false,
            autoClosingBrackets: true,
            minimap: { enabled: false },
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
            overviewRulerLanes: 0,
            wordBasedSuggestions: false,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            find: false,
            matchBrackets: true,
            lineNumbers: 'off',
            overviewRulerBorder: false,
            lineDecorationsWidth: 0,
            ariaLabel: false,
            codeLens: false,
            rulers: false,
            colorDecorators: false,
            extraEditorClassName: 'cli',
            folding: false,
            fontSize: 13,
            lineHeight: 22,
            fixedOverflowWidgets: true,
            iconsInSuggestions: false,
            quickSuggestionsDelay: 10,
            accessibilitySupport: false,
          }}
        />
      </div>
    );
  }
}

export default Input;
