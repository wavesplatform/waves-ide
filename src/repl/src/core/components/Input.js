import React, { Component } from 'react';
//import MonacoEditor from 'react-monaco-editor';
// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

class Input extends Component {
  constructor(props) {
    super(props);
    this.input = null;
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
    const code = keycodes[e.keyCode];
    const { multiline } = this.state;
    const { history } = this.props;
    let { historyCursor } = this.state;

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
        // this.onChange();
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
    if (code === 'enter' || e.code == 'Enter') {
      if (e.shiftKey) {
        return;
      }

      if (!command) {
        e.preventDefault();
        return;
      }

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
    editor.onKeyDown((e) => { this.onKeyPress(e); });

    monaco.languages.typescript.javascriptDefaults.addExtraLib([
      'declare class Facts {',
      '    /**',
      '     * Returns the next fact',
      '     */',
      '    static next():string',
      '}',
    ].join('\n'), 'filename/facts.d.ts');


    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare function keys
    `);


    editor.focus();

  }

  render() {
    const { autoFocus } = this.props;
    return (

      <div className="Input">
        {/* <Autocomplete value={this.state.value} /> */}
        <textarea
          className="cli"
          rows={this.state.rows}
          autoFocus={autoFocus}
          ref={e => {
            this.input = e;
            this.props.inputRef(e);
          }}
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyPress}
        />
        {/* <MonacoEditor
          language="javascript"
          value={this.state.value}
          height={100}
          ref={e => {
            this.input = e;
            this.props.inputRef(e);
          }}

          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
          options={{
            language: 'javascript',
            selectOnLineNumbers: false,
            glyphMargin: false,
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
          }}
        //onChange={this.onChange}
        //editorDidMount={: :this.editorDidMount}
        /> */}
      </div>
    );
  }
}

export default Input;
