import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { DARK_THEME_ID, DEFAULT_THEME_ID } from '@src/setupMonaco';
import rideLanguageService from '@services/rideLanguageService';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, FilesStore, SettingsStore, TAB_TYPE, TabsStore, TFile, UIStore } from '@stores';
import { mediator, testRunner } from '@services';
import styles from './styles.less';
import { computed, Lambda, observe, reaction } from 'mobx';

interface IProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore
    tabsStore?: TabsStore
    uiStore?: UIStore
}

export enum EVENTS {
    OPEN_SEARCH_BAR = 'openSearchBar',
    UPDATE_THEME = 'updateTheme',
    SAVE_VIEW_STATE = 'saveViewState',
    RESTORE_VIEW_STATE = 'restoreViewState',
}


@inject('filesStore', 'tabsStore', 'settingsStore', 'uiStore')
@observer
export default class Editor extends React.Component<IProps> {
    editor: monaco.editor.ICodeEditor | null = null;
    monaco?: typeof monaco;
    modelReactionDisposer?: Lambda;
    setDeltaDecorationsDisposer?: Lambda;
    deltaDecorations: string[] = [];

    componentWillUnmount() {
        this.modelReactionDisposer && this.modelReactionDisposer();
        this.setDeltaDecorationsDisposer && this.setDeltaDecorationsDisposer();
        this.unsubscribeToComponentsMediator();
    }

    onChange = (file: TFile) => {
        const filesStore = this.props.filesStore!;
        const changeFn = filesStore.getDebouncedChangeFnForFile(file.id);
        let startedTest;
        if (testRunner.isRunning && file.id === testRunner.info.fileId && file.type === FILE_TYPE.JAVA_SCRIPT) {
            const val = file.info.parsingResult.find(({fullTitle}) => fullTitle === testRunner.info.fullTitle);
            if (val) startedTest = val.range.startLineNumber;
        }
        this.setDeltaDecorations(file.id, this.decorationsRange, startedTest);
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
        let ststus: string | null = null;
        if (e.target.element!.className.includes('myGlyphMarginClass_runned')) ststus = 'runned';
        if (e.target.element!.className.includes('myGlyphMarginClass_ready')) ststus = 'ready';

        if (e.target.element && e.target.position && ststus != null) {
            const file = this.props.filesStore!.currentFile;
            if (file && file.type === FILE_TYPE.JAVA_SCRIPT) {
                const testParsingData = file.info.parsingResult
                    .find(({range: {startLineNumber: row}}) => row === e.target.position!.lineNumber);
                if (testParsingData) {
                    if (ststus === 'runned') testRunner.stopTest();
                    else if (ststus === 'ready') {
                        testRunner.runTest(file, testParsingData.fullTitle).then(() => {
                            this.setDeltaDecorations(
                                file.id,
                                this.decorationsRange,
                                testParsingData.range.startLineNumber
                            );
                            this.props.uiStore!.replsPanel.activeTab = 'Tests';
                            reaction(() => testRunner.isRunning, (isRunning, reaction) => {
                                if (!isRunning) {
                                    this.setDeltaDecorations(file.id, this.decorationsRange);
                                    reaction.dispose();
                                }
                            });
                        });
                    }
                }
            }
        }
    };

    private setDeltaDecorations = (fileId: string, ranges: monaco.IRange[], startedTest?: number) => {
        if (ranges.length === 0) return;
        const getClassName = (line: number) => {
            let className = styles.myGlyphMarginClass_disabled;
            if (!testRunner.isRunning && !startedTest) className = styles.myGlyphMarginClass_ready;
            else if (testRunner.isRunning && startedTest === line) className = styles.myGlyphMarginClass_runned;
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
            result = file.info.parsingResult.map(({range}) => range);
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
        this.modelReactionDisposer = observe(this.props.tabsStore!, 'currentModel', this.restoreModel);
        this.setDeltaDecorationsDisposer = reaction(
            () => this.decorationsRange,
            (range) => this.props.filesStore!.currentFile &&
                this.setDeltaDecorations(this.props.filesStore!.currentFile.id, range)
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

