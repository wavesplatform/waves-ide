import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import debounce from 'debounce';
import { languageService, DEFAULT_THEME_ID, DARK_THEME_ID } from '@src/setupMonaco';
import { IProps, IState } from './types';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE } from '@stores';
import TestReplMediatorContext from '@utils/ComponentsMediatorContext';

export const events = {
    OPEN_SEARCH_BAR: 'openSearchBar',
    UPDATE_FONT_SIZE: 'updateFontSize',
    UPDATE_THEME: 'updateTheme',
};

@inject('filesStore')
@observer
export default class Editor extends React.Component<IProps, IState> {
    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;

    onChange = (newValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        const {filesStore} = this.props;
        const file = filesStore!.currentFile;
        if (file) {
            filesStore!.changeFileContent(file.id, newValue);
        }
        this.validateDocument();
    };

    validateDocument = () => {
        if (this.editor && this.monaco) {
            const model = this.editor.getModel();
            if (model == null) return;
            const errors = languageService.validateTextDocument(model);
            this.monaco.editor.setModelMarkers(model, '', errors);
        }
    };

    subscribeToComponentsMediator = () => {

        let ComponentsMediator = this.context;

        ComponentsMediator!.subscribe(
            events.OPEN_SEARCH_BAR,
            () => this.editor!.getAction('actions.find').run()
        );
        ComponentsMediator!.subscribe(
            events.UPDATE_FONT_SIZE,
            (size) => this.editor!.updateOptions({fontSize: size})
        );
        ComponentsMediator!.subscribe(
            events.UPDATE_THEME,
            (isDark) => isDark
                ? this.monaco!.editor.setTheme(DARK_THEME_ID)
                : this.monaco!.editor.setTheme(DEFAULT_THEME_ID)
        );
    };

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;
        this.validateDocument();
        this.subscribeToComponentsMediator();
    };

    componentWillUnmount() {

        let ComponentsMediator = this.context;

        ComponentsMediator!['unsubscribe'](
            events.OPEN_SEARCH_BAR,
            () => this.editor!.getAction('actions.find').run()
        );
        ComponentsMediator!.unsubscribe(
            events.UPDATE_FONT_SIZE,
            (size) => this.editor!.updateOptions({fontSize: size})
        );
        ComponentsMediator!.unsubscribe(
            events.UPDATE_THEME,
            (isDark) => isDark
                ? this.monaco!.editor.setTheme(DARK_THEME_ID)
                : this.monaco!.editor.setTheme(DEFAULT_THEME_ID)
        );
    }

    public render() {
        const {filesStore} = this.props;
        const file = filesStore!.currentFile;

        if (!file) return null;

        const language = file.type === FILE_TYPE.JAVA_SCRIPT ? 'javascript' : 'ride';

        const options: monaco.editor.IEditorConstructionOptions = {
            //language: language,
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
            <div style={{flex: 1, width: 0}}>
                <ReactResizeDetector
                    handleWidth
                    handleHeight
                    render={({width, height}) => (
                        <MonacoEditor
                            width={width}
                            height={height}
                            theme={DEFAULT_THEME_ID}
                            language={language}
                            value={file.content}
                            options={options}
                            onChange={debounce(this.onChange, 2000)}
                            editorDidMount={this.editorDidMount}
                        />
                    )}
                />
            </div>
        );
    }
}
