import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { languageService, DEFAULT_THEME_ID, DARK_THEME_ID } from '@src/setupMonaco';
import { IProps, IState } from './types';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, IFile } from '@stores';
import { mediator } from '@services';
import styles from './styles.less';
export enum EVENTS  {
    OPEN_SEARCH_BAR = 'openSearchBar',
    UPDATE_FONT_SIZE = 'updateFontSize',
    UPDATE_THEME = 'updateTheme'
}

@inject('filesStore', 'uiStore')
@observer
export default class Editor extends React.Component<IProps, IState> {
    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;

    onChange = (file: IFile) => {
        const filesStore = this.props.filesStore!;
        const changeFn = filesStore.getDebouncedChangeFnForFile(file.id);
        return (newValue: string) => {
            changeFn(newValue);
            this.validateDocument();
        };
    };


    validateDocument = () => {
        if (this.editor && this.monaco) {
            const model = this.editor.getModel();
            if (model == null) return;
            const errors = languageService.validateTextDocument(model);
            this.monaco.editor.setModelMarkers(model, '', errors);
        }
    };

    private findAction = () => this.editor && this.editor.getAction('actions.find').run();

    private updateFontSize = (size: number) => this.editor && this.editor.updateOptions({fontSize: size});

    private updateTheme = (isDark: boolean) => this.monaco && isDark ?
        this.monaco.editor.setTheme(DARK_THEME_ID) :
        this.monaco!.editor.setTheme(DEFAULT_THEME_ID);

    subscribeToComponentsMediator(){

        mediator.subscribe(
            EVENTS.OPEN_SEARCH_BAR,
            this.findAction
        );
        mediator.subscribe(
            EVENTS.UPDATE_FONT_SIZE,
            this.updateFontSize
        );
        mediator.subscribe(
            EVENTS.UPDATE_THEME,
            this.updateTheme
        );
    }

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;
        this.validateDocument();
        this.subscribeToComponentsMediator();

        let viewZoneId = null;
        e.changeViewZones(function(changeAccessor) {
            const domNode = document.createElement('div');
            domNode.style.background = 'white';
            viewZoneId = changeAccessor.addZone({
                afterLineNumber: 0,
                heightInLines: 1,
                domNode: domNode
            });
        });
    };

    componentWillUnmount() {
        mediator.unsubscribe(
            EVENTS.OPEN_SEARCH_BAR,
            this.findAction
        );
        mediator.unsubscribe(
            EVENTS.UPDATE_FONT_SIZE,
            this.updateFontSize
        );
        mediator.unsubscribe(
            EVENTS.UPDATE_THEME,
            this.updateTheme
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
            readOnly: file.readonly,
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            // scrollbar: {vertical: 'hidden', horizontal: 'hidden'},
            // hideCursorInOverviewRuler: true,
            overviewRulerLanes: 0,
            wordBasedSuggestions: true,
            acceptSuggestionOnEnter: 'on',
            fontSize: this.props.uiStore!.editorSettings.fontSize
        };

        return (
            <div className={styles.root}>
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
                            onChange={this.onChange(file)}
                            editorDidMount={this.editorDidMount}
                        />
                    )}
                />
            </div>
        );
    }
}

