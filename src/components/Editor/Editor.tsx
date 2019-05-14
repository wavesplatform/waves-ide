import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { DARK_THEME_ID, DEFAULT_THEME_ID, languageService } from '@src/setupMonaco';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, FilesStore, IFile, TabsStore, UIStore } from '@stores';
import { mediator } from '@services';
import styles from './styles.less';
import { observe } from 'mobx';

interface IProps {
    filesStore?: FilesStore
    uiStore?: UIStore
    tabsStore?: TabsStore
}

export enum EVENTS {
    OPEN_SEARCH_BAR = 'openSearchBar',
    UPDATE_THEME = 'updateTheme',
    SAVE_VIEW_STATE = 'saveViewState',
    RESTORE_VIEW_STATE = 'restoreViewState'
}


@inject('filesStore', 'tabsStore', 'uiStore')
@observer
export default class Editor extends React.Component<IProps> {
    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;


    componentWillUnmount() {
        this.unsubscribeToComponentsMediator();
    }

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

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;
        this.validateDocument();
        this.subscribeToComponentsMediator();
        this.createReactions();

        let viewZoneId = null;
        e.changeViewZones(function (changeAccessor) {
            const domNode = document.createElement('div');
            domNode.style.background = 'white';
            viewZoneId = changeAccessor.addZone({
                afterLineNumber: 0,
                heightInLines: 1,
                domNode: domNode
            });
        });
    };


    subscribeToComponentsMediator() {
        mediator.subscribe(
            EVENTS.OPEN_SEARCH_BAR,
            this.findAction
        );
        mediator.subscribe(
            EVENTS.UPDATE_THEME,
            this.updateTheme
        );
        mediator.subscribe(
            EVENTS.SAVE_VIEW_STATE,
            this.saveViewState
        );
        mediator.subscribe(
            EVENTS.RESTORE_VIEW_STATE,
            this.restoreViewState
        );
    }

    unsubscribeToComponentsMediator() {
        mediator.unsubscribe(
            EVENTS.OPEN_SEARCH_BAR,
            this.findAction
        );
        mediator.unsubscribe(
            EVENTS.UPDATE_THEME,
            this.updateTheme
        );
        mediator.unsubscribe(
            EVENTS.SAVE_VIEW_STATE,
            this.saveViewState
        );
        mediator.unsubscribe(
            EVENTS.RESTORE_VIEW_STATE,
            this.restoreViewState
        );
    }


    private findAction = () => this.editor && this.editor.getAction('actions.find').run();

    private updateTheme = (isDark: boolean) => this.monaco && isDark ?
        this.monaco.editor.setTheme(DARK_THEME_ID) :
        this.monaco!.editor.setTheme(DEFAULT_THEME_ID);


    private saveViewState = () => {
        const tabStore = this.props.tabsStore;
        if (!tabStore) return;
        const i = tabStore.activeTabIndex;
        const viewState = this.editor!.saveViewState();
        if (viewState != null) tabStore.tabs[i] = {...tabStore.tabs[i], viewState};
    };

    private restoreViewState = () => {
        const tabsStore = this.props.tabsStore;
        if (!tabsStore) return;

        if (tabsStore.activeTab && tabsStore.activeTab.viewState) {
            this.editor!.restoreViewState(tabsStore.activeTab.viewState);
        }
    };

    private createReactions = () => {
        const tabsStore = this.props.tabsStore;
        if (tabsStore) observe(tabsStore, 'activeTabIndex', () => this.restoreViewState());
    };


    public render() {
        const {filesStore} = this.props;
        const file = filesStore!.currentFile;

        if (!file) return null;

        const language = file.type === FILE_TYPE.JAVA_SCRIPT ? 'javascript' : 'ride';

        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            glyphMargin: false,
            autoClosingBrackets: 'always',
            readOnly: file.readonly,
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
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

