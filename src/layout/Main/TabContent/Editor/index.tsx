import React from 'react';
import ResizeDetector from '@components/ResizeDetector';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { DARK_THEME_ID, DEFAULT_THEME_ID } from '@src/setupMonaco';
import rideLanguageService from '@services/rideLanguageService';
import { inject, observer } from 'mobx-react';
import {
    FILE_TYPE,
    FilesStore,
    IRideFile,
    SettingsStore,
    TAB_TYPE,
    TabsStore,
    TestsStore,
    TFile,
    UIStore
} from '@stores';
import { mediator } from '@services';
import styles from './styles.less';
import { Lambda, reaction } from 'mobx';
import { scriptInfo } from '@waves/ride-js';

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
    editor: monaco.editor.IStandaloneCodeEditor | null = null;
    monaco?: typeof monaco;
    setDeltaDecorationsDisposer?: Lambda;
    changeFileReactionDisposer?: Lambda;
    activeTabReactionDisposer?: Lambda;
    deltaDecorations: string[] = [];

    componentWillUnmount() {
        this.setDeltaDecorationsDisposer && this.setDeltaDecorationsDisposer();
        this.changeFileReactionDisposer && this.changeFileReactionDisposer();
        this.activeTabReactionDisposer && this.activeTabReactionDisposer();
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

    validateDocument = async () => {
        if (this.editor && this.monaco) {
            const model = this.editor.getModel();
            if (model == null || model.getLanguageId() !== 'ride') return;

            const rideFileInfo = scriptInfo(this.props.filesStore?.currentFile?.content || '');
            let rawImports: string[] = [];
            let imports: string[] = [];
            if (!('error' in rideFileInfo)) {
                rawImports = rideFileInfo.imports;
                imports = rideFileInfo.imports.map((name: string) => name.endsWith('.ride') ? name : `${name}.ride`);
            }

            let libraries = {} as Record<string, string>;
            this.props.filesStore?.files.filter(file => {
                return imports.indexOf(file.name) != -1;
            }).map(file => {
                const libName = rawImports.find((name: string) => name === file.name || `${name}.ride` === file.name);
                libraries[libName || file.name] = file.content
            });

            const errors = await rideLanguageService.validateTextDocument(model, libraries);
            this.monaco.editor.setModelMarkers(model, '', errors);
        }
    };

    editorDidMount = (e: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {
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
        if (!testParsingData) return;

        if (ststus === 'runned') {
            testsStore.stopTest();
        } else if (ststus === 'ready') {
            testsStore.runTest(file, testParsingData.fullTitle).then(() => {
                this.setDeltaDecorations(
                    file.id,
                    this.getDecorationsRange(file),
                    testsStore.running,
                    testParsingData.identifierRange.startLineNumber
                );
                this.props.uiStore!.replsPanel.activeTab = 'Tests';
                const dispose = reaction(() => testsStore.running, (isRunning) => {
                    if (!isRunning) {
                        this.setDeltaDecorations(file.id, this.getDecorationsRange(file), testsStore.running);
                        dispose();
                    }
                });
            });
        }
    };

    private setDeltaDecorations = (fileId: string, ranges: monaco.IRange[], running: boolean, startedTest?: number) => {
        if (ranges.length === 0) return;
        const getClassName = (line: number) => {
            let className = styles.myGlyphMarginClass_disabled;
            if (!running && !startedTest) {
                className = styles.myGlyphMarginClass_ready;
            } else if (running && startedTest === line) className = styles.myGlyphMarginClass_runned;
            return className;
        };
        this.deltaDecorations = this.editor!.deltaDecorations(
            this.deltaDecorations,
            ranges.map(range => ({range, options: {glyphMarginClassName: getClassName(range.startLineNumber)}}))
        );
    };

    private getDecorationsRange(file = this.props.filesStore!.currentFile): monaco.IRange[] {
        let result: monaco.IRange[] = [];
        if (file != null && this.editor != null && file.type === FILE_TYPE.JAVA_SCRIPT) {
            result = file.info.parsingResult.map(({identifierRange}) => identifierRange);
        }
        return result;
    }

    private findAction = () => {
        if (!this.editor) return;
        this.editor.getAction('actions.find')?.run();
    };

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
        const newModel = this.props.tabsStore!.currentModel;
        const currentModel = this.editor!.getModel();

        console.log('[Editor] restoreModel called');
        console.log('[Editor] current editor model:', currentModel?.getLanguageId());
        console.log('[Editor] new model from tabsStore:', newModel?.getLanguageId());
        console.log('[Editor] models are same?', currentModel === newModel);

        if (newModel && currentModel !== newModel) {
            this.editor!.setModel(newModel);
            this.restoreViewState();
            this.validateDocument();
            this.addSpaceBeforeEditor();
        }
    };

    private createReactions = () => {
        const testsStore = this.props.testsStore!;
        const filesStore = this.props.filesStore!;
        const tabsStore = this.props.tabsStore!;

        this.changeFileReactionDisposer = reaction(
            () => {

                const file = filesStore.currentFile;
                console.log('[Editor] reaction tracking currentFile:', file?.name);
                return file;
            },

            (file) => {
                console.log('currentFile changed:', file?.name);
                if (!file) return;
                this.restoreModel();
            }
        );

        this.setDeltaDecorationsDisposer = reaction(
            () => ({running: testsStore.running, file: filesStore.currentFile}),
            ({running, file}) => {
                if (!file) return;
                const range = this.getDecorationsRange(file);
                let startedTest;
                if (testsStore.running && file.id === testsStore.fileId && file.type === FILE_TYPE.JAVA_SCRIPT) {
                    const val = file.info.parsingResult
                        .find(({fullTitle}) => fullTitle === testsStore.testFullTitle);
                    if (val) startedTest = val.identifierRange.startLineNumber;
                }
                this.setDeltaDecorations(file.id, range, running, startedTest);
            }
        );

        // Новая реакция на activeTab
        this.activeTabReactionDisposer = reaction(
            () => tabsStore.activeTab,
            (activeTab) => {
                console.log('activeTab changed:', activeTab);
                if (this.editor && activeTab && activeTab.type === TAB_TYPE.EDITOR) {
                    const newModel = tabsStore.currentModel;
                    if (newModel && this.editor.getModel() !== newModel) {
                        this.editor.setModel(newModel);
                        this.restoreViewState();
                        this.validateDocument();
                    }
                }
            }
        );
    };


    public render() {
        console.log('Editor render, tabsStore:', this.props.tabsStore);
        console.log('Editor render, filesStore:', this.props.filesStore);
        const file = this.props.filesStore!.currentFile;
        console.log('[Editor] currentFile from store:', file?.name);
        if (!file) {
            console.log('[Editor] no file, returning null');
            return null;
        }
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
            acceptSuggestionOnEnter: 'on',
            fontSize: this.props.uiStore!.editorSettings.fontSize,
        };

        return (
            <div className={styles.root}>
                <ResizeDetector
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

