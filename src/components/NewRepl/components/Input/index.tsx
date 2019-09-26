import * as React from 'react';
import styles from './styles.less';
import { DARK_THEME_ID, DEFAULT_THEME_ID, LANGUAGE_ID } from '@src/setupMonaco';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import MonacoEditor from 'react-monaco-editor';

interface IProps {

}

interface IState {
    // value: string
}

@observer
export class Input extends React.Component<IProps> {
    @observable value: string = '';

    @action
    onChange = (value: string) => this.value = value;

    onKeyPress = (e: monaco.IKeyboardEvent) => {
        const code = e.browserEvent.code;
        console.log(code);
    };
    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        e.onKeyDown(e => this.onKeyPress(e));
        e.focus();
    };

    render() {

        const options: monaco.editor.IEditorConstructionOptions = {
            language: LANGUAGE_ID,
            selectOnLineNumbers: false,
            glyphMargin: false,
            autoClosingBrackets: 'always',
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            scrollbar: {vertical: 'hidden', horizontal: 'hidden'},
            overviewRulerLanes: 0,
            wordBasedSuggestions: true,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            find: {
                seedSearchStringFromSelection: false,
                autoFindInSelection: false,
                addExtraSpaceOnTop: false,
            },
            matchBrackets: true,
            lineNumbers: 'off' as 'off',
            overviewRulerBorder: false,
            lineDecorationsWidth: 0,
            // ariaLabel: false,
            codeLens: false,
            // rulers: false,
            colorDecorators: false,
            extraEditorClassName: 'cli',
            folding: false,
            fontSize: 12,
            lineHeight: 22,
            fixedOverflowWidgets: true,
            // quickSuggestionsDelay: 10,
            // accessibilitySupport: 'off',
        };

        return <div className={styles.root}>
            <MonacoEditor
                value={this.value}
                theme={DEFAULT_THEME_ID}
                height={26}
                options={options}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
            />
        </div>;

    }
}
