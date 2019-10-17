import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { DARK_THEME_ID, DEFAULT_THEME_ID } from '@src/setupMonaco';
import rideLanguageService from '@services/rideLanguageService';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, FilesStore, SettingsStore, TAB_TYPE, TabsStore, TestsStore, TFile, UIStore } from '@stores';
import { mediator } from '@services';
import styles from './styles.less';
import { computed, Lambda, observe, reaction } from 'mobx';

interface IProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore
    tabsStore?: TabsStore
    uiStore?: UIStore
    testsStore?: TestsStore
}

export enum EVENTS {
    OPEN_SEARCH_BAR = 'openSearchBar',
    UPDATE_THEME = 'updateTheme',
    SAVE_VIEW_STATE = 'saveViewState',
    RESTORE_VIEW_STATE = 'restoreViewState',
}


@inject('filesStore', 'tabsStore', 'settingsStore', 'uiStore', 'testsStore')
@observer
export default class Editor extends React.Component<IProps> {
    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;
    setDeltaDecorationsDisposer?: Lambda;
    changeFileReactionDisposer?: Lambda;
    deltaDecorations: string[] = [];

    componentWillUnmount() {
        this.setDeltaDecorationsDisposer && this.setDeltaDecorationsDisposer();
        this.changeFileReactionDisposer && this.changeFileReactionDisposer();
        this.unsubscribeToComponentsMediator();
    }

    onChange = (file: TFile) => {
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
            if (model == null || (model as any).getLanguageIdentifier().language !== 'ride') return;
            const errors = rideLanguageService.validateTextDocument(model);
            this.monaco.editor.setModelMarkers(model, '', errors);
        }
    };

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;
        this.props.settingsStore!.theme === 'dark'
            ? m.editor.setTheme(DARK_THEME_ID)
            : m.editor.setTheme(DEFAULT_THEME_ID);
        this.subscribeToComponentsMediator();
        this.createReactions();
        this.restoreModel();
        e.onMouseDown(this.handleMouseDown);
    };

    addSpaceBeforeEditor = () => {
        let viewZoneId = null;
        this.editor!.changeViewZones(function (changeAccessor) {
            const domNode = document.createElement('div');
            domNode.style.background = 'transparent';
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

    private handleMouseDown = (e: monaco.editor.IEditorMouseEvent) => {
        const file = this.props.filesStore!.currentFile;
        const testsStore = this.props.testsStore!;
        let ststus: string | null = null;

        if (e.target.element!.className.includes('myGlyphMarginClass_runned')) ststus = 'runned';
        if (e.target.element!.className.includes('myGlyphMarginClass_ready')) ststus = 'ready';
        if (!file || file.type !== FILE_TYPE.JAVA_SCRIPT || !e.target.element || !e.target.position || ststus == null) {
            return;
        }

        const testParsingData = file.info.parsingResult
            .find(({identifierRange: {startLineNumber: row}}) => row === e.target.position!.lineNumber);
        if (testParsingData) {
            if (ststus === 'runned') testsStore.stopTest();
            else if (ststus === 'ready') {
                testsStore.runTest(file, testParsingData.fullTitle).then(() => {
                    this.setDeltaDecorations(
                        file.id,
                        this.decorationsRange,
                        testParsingData.identifierRange.startLineNumber
                    );
                    this.props.uiStore!.replsPanel.activeTab = 'Tests';
                    reaction(() => testsStore.running, (isRunning, reaction) => {
                        if (!isRunning) {
                            this.setDeltaDecorations(file.id, this.decorationsRange);
                            reaction.dispose();
                        }
                    });
                });
            }
        }
    };

    private setDeltaDecorations = (fileId: string, ranges: monaco.IRange[], startedTest?: number) => {
        const testsStore = this.props.testsStore!;
        if (ranges.length === 0) return;
        const getClassName = (line: number) => {
            let className = styles.myGlyphMarginClass_disabled;
            if (!testsStore.running && !startedTest) className = styles.myGlyphMarginClass_ready;
            else if (testsStore.running && startedTest === line) className = styles.myGlyphMarginClass_runned;
            return className;
        };
        this.deltaDecorations = this.editor!.deltaDecorations(
            this.deltaDecorations,
            ranges.map(range => ({range, options: {glyphMarginClassName: getClassName(range.startLineNumber)}}))
        );
    };

    @computed
    get decorationsRange(): monaco.IRange[] {
        const file = this.props.filesStore!.currentFile;
        let result: monaco.IRange[] = [];
        if (file != null && this.editor != null && file.type === FILE_TYPE.JAVA_SCRIPT) {
            result = file.info.parsingResult.map(({identifierRange}) => identifierRange);
        }
        return result;
    }

    private findAction = () => this.editor && this.editor.getAction('actions.find').run();

    private updateTheme = (theme: string) => {
        this.monaco && (theme === 'dark' ?
                this.monaco.editor.setTheme(DARK_THEME_ID) :
                this.monaco.editor.setTheme(DEFAULT_THEME_ID)
        );
    };

    private saveViewState = () => {
        const viewState = this.editor!.saveViewState();
        const activeTab = this.props.tabsStore!.activeTab;
        if (viewState != null && activeTab && activeTab.type === TAB_TYPE.EDITOR) activeTab.viewState = viewState;
    };

    private restoreViewState = () => {
        const activeTab = this.props.tabsStore!.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR && activeTab.viewState) {
            this.editor!.restoreViewState(activeTab.viewState);
        }
    };

    private restoreModel = () => {
        this.editor!.setModel(this.props.tabsStore!.currentModel);
        this.restoreViewState();
        this.validateDocument();
        this.addSpaceBeforeEditor();
    };

    private createReactions = () => {
        const testsStore = this.props.testsStore!;
        this.setDeltaDecorationsDisposer = reaction(
            () => this.decorationsRange,
            (range) => this.props.filesStore!.currentFile &&
                this.setDeltaDecorations(this.props.filesStore!.currentFile.id, range)
        );
        this.changeFileReactionDisposer = reaction(
            () => this.props.filesStore!.currentFile,
            (file) => {
                if (!file) return;
                this.restoreModel();
                let startedTest;
                if (testsStore.running && file.id === testsStore.fileId && file.type === FILE_TYPE.JAVA_SCRIPT) {
                    const val = file.info.parsingResult
                        .find(({fullTitle}) => fullTitle === testsStore.testFullTitle);
                    if (val) startedTest = val.identifierRange.startLineNumber;
                }
                this.setDeltaDecorations(file.id, this.decorationsRange, startedTest);
            }
        );
    };


    public render() {
        const file = this.props.filesStore!.currentFile;
        if (!file) return null;
        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            glyphMargin: file.type === FILE_TYPE.JAVA_SCRIPT,
            autoClosingBrackets: 'always',
            readOnly: file.readonly,
            minimap: {enabled: false},
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            wordBasedSuggestions: true,
            acceptSuggestionOnEnter: 'on',
            fontSize: this.props.uiStore!.editorSettings.fontSize,
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
                            theme={this.props.settingsStore!.theme === 'dark' ? DARK_THEME_ID : DEFAULT_THEME_ID}
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

