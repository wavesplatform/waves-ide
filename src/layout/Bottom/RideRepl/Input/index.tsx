import * as React from 'react';
import styles from './styles.less';
import { DARK_THEME_ID, DEFAULT_THEME_ID, LANGUAGE_ID } from '@src/setupMonaco';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import MonacoEditor from 'react-monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import { SettingsStore } from '@stores/SettingsStore';

interface IProps {
    settingsStore?: SettingsStore
    onSubmit: (cmd: string) => void
    getHistoryCommand?: (type: 'previous' | 'next') => void
}

interface IState {
    // value: string
}

@inject('settingsStore')
@observer
export class Input extends React.Component<IProps> {
    ref = React.createRef<HTMLDivElement>();

    @observable value: string = '';

    @action
    onChange = (value: string, event?: monaco.editor.IModelContentChangedEvent) => {
        this.value = value;
    }

    setupHandlers = (editor: monaco.editor.IStandaloneCodeEditor) => {
        const suggestWidgetIsNotOpenRule = '!suggestWidgetVisible'
        editor.addCommand(monaco.KeyCode.Enter, () => {
            this.props.onSubmit(this.value);
            this.onChange('');
        }, suggestWidgetIsNotOpenRule);

        editor.addCommand(monaco.KeyCode.UpArrow, () => {
            const historyCommand = this.props.getHistoryCommand && this.props.getHistoryCommand('previous');
            if (historyCommand != null) this.onChange(historyCommand);
        }, suggestWidgetIsNotOpenRule);

        editor.addCommand(monaco.KeyCode.DownArrow, () => {
            const historyCommand = this.props.getHistoryCommand && this.props.getHistoryCommand('next');
            if (historyCommand != null) this.onChange(historyCommand);
        }, suggestWidgetIsNotOpenRule);
    };

    editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {        
        this.setupHandlers(editor)
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

        const value = this.value;
        return <div className={styles.root} ref={this.ref}>
            <ReactResizeDetector
                handleWidth
                render={({width, height}) => (
                    <MonacoEditor
                        value={value}
                        theme={this.props.settingsStore!.theme === 'dark' ? DARK_THEME_ID : DEFAULT_THEME_ID}
                        height={height}
                        width={(width || 0) - 10 /*prompt right margin*/}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                )}
            />
        </div>;

    }
}
