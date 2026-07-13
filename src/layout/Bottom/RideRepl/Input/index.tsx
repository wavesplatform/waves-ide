import * as React from 'react';
import styles from './styles.less';
import { DARK_THEME_ID, DEFAULT_THEME_ID, LANGUAGE_ID } from '@src/setupMonaco';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { action, makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import MonacoEditor from 'react-monaco-editor';
import ResizeDetector from '@components/ResizeDetector';
import { SettingsStore } from '@stores/SettingsStore';

interface IProps {
    settingsStore?: SettingsStore
    onSubmit: (cmd: string) => void
    getHistoryCommand?: (type: 'previous' | 'next') => void
}

@inject('settingsStore')
@observer
export class Input extends React.Component<IProps> {
    ref = React.createRef<HTMLDivElement>();

    @observable value: string = '';

    constructor(props: IProps) {
        super(props);
        makeObservable(this);
    }

    @action
    onChange = (value: string, _event?: monaco.editor.IModelContentChangedEvent) => {
        this.value = value;
    }

    setupHandlers = (editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {
        const suggestWidgetIsNotOpenRule = '!suggestWidgetVisible';

        const setEditorValue = (value: string) => {
            editor.setValue(value);
            this.onChange(value);
            const model = editor.getModel();
            const lineNumber = model?.getLineCount() || 1;
            editor.setPosition({
                lineNumber,
                column: model?.getLineMaxColumn(lineNumber) || 1
            });
        };

        editor.onKeyDown((event) => {
            if (event.keyCode !== m.KeyCode.Enter || event.shiftKey) return;

            const command = editor.getValue() || this.value;
            this.props.onSubmit(command);
            setEditorValue('');
            event.preventDefault();
            event.stopPropagation();
        });

        editor.addCommand(monaco.KeyCode.UpArrow, () => {
            const historyCommand = this.props.getHistoryCommand && this.props.getHistoryCommand('previous');
            if (historyCommand != null) setEditorValue(historyCommand);
        }, suggestWidgetIsNotOpenRule);

        editor.addCommand(monaco.KeyCode.DownArrow, () => {
            const historyCommand = this.props.getHistoryCommand && this.props.getHistoryCommand('next');
            if (historyCommand != null) setEditorValue(historyCommand);
        }, suggestWidgetIsNotOpenRule);
    };

    editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {        
        this.setupHandlers(editor, m);
    };

    render() {
        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: false,
            glyphMargin: false,
            autoClosingBrackets: 'always',
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            scrollbar: {vertical: 'hidden', horizontal: 'hidden'},
            overviewRulerLanes: 0,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            find: {
                seedSearchStringFromSelection: 'never',
                autoFindInSelection: 'never',
                addExtraSpaceOnTop: false,
            },
            matchBrackets: 'always',
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
            <ResizeDetector
                handleWidth
                render={({width, height}) => (
                    <MonacoEditor
                        value={value}
                        language={LANGUAGE_ID}
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
