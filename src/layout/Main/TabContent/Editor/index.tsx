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
    private currentValidationRequestId = 0;
    private isDisposed = false;

    private setDeltaDecorationsDisposer?: Lambda;
    private changeFileReactionDisposer?: Lambda;
    private deltaDecorations: string[] = [];

    componentWillUnmount() {
        this.isDisposed = true;

        this.changeFileReactionDisposer?.();
        this.setDeltaDecorationsDisposer?.();
        this.unsubscribeToComponentsMediator();

        if (this.editor) {
            this.editor = null;
        }
    }

    onChange = (file: TFile) => {
        const changeFn = this.props.filesStore!.getDebouncedChangeFnForFile(file.id);
        return (newValue: string) => {
            changeFn(newValue);
            this.validateDocument();
        };
    };

    validateDocument = async () => {
        if (this.isDisposed || !this.editor || !this.monaco) return;

        const requestId = ++this.currentValidationRequestId;
        const model = this.editor.getModel();

        if (!model || model.getLanguageId() !== 'ride') return;

        const currentFile = this.props.filesStore?.currentFile;
        if (!currentFile) return;

        const rideFileInfo = scriptInfo(currentFile.content);
        if ('error' in rideFileInfo) return;

        const imports = rideFileInfo.imports.map(name => name.endsWith('.ride') ? name : `${name}.ride`);

        let libraries: Record<string, string> = {};
        this.props.filesStore?.files
            .filter(file => imports.includes(file.name))
            .forEach(file => {
                const libName = rideFileInfo.imports.find(name => name === file.name || `${name}.ride` === file.name);
                if (libName) libraries[libName] = file.content;
            });

        const errors = await rideLanguageService.validateTextDocument(model, libraries);

        if (requestId !== this.currentValidationRequestId) return;
        if (this.isDisposed || !this.editor || this.editor.getModel() !== model) return;

        this.monaco.editor.setModelMarkers(model, '', errors);
    };

    editorDidMount = (e: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {
        this.editor = e;
        this.monaco = m;

        const isDark = this.props.settingsStore!.theme === 'dark';
        m.editor.setTheme(isDark ? DARK_THEME_ID : DEFAULT_THEME_ID);

        this.subscribeToComponentsMediator();
        this.createReactions();
        this.restoreModel();
        e.onMouseDown(this.handleMouseDown);
    };

    private restoreModel = () => {
        if (this.isDisposed || !this.editor) return;

        const newModel = this.props.tabsStore!.currentModel;
        const currentModel = this.editor.getModel();

        if (newModel && currentModel !== newModel) {
            this.editor.setModel(newModel);
            setTimeout(() => {
                if (!this.isDisposed && this.editor) {
                    this.restoreViewState();
                    this.validateDocument();
                    this.addSpaceBeforeEditor();
                }
            }, 50);
        }
    };

    private addSpaceBeforeEditor = () => {
        this.editor!.changeViewZones((changeAccessor) => {
            const domNode = document.createElement('div');
            domNode.style.background = 'transparent';
            changeAccessor.addZone({
                afterLineNumber: 0,
                heightInLines: 1,
                domNode: domNode
            });
        });
    };

    private createReactions = () => {
        const testsStore = this.props.testsStore!;
        const filesStore = this.props.filesStore!;

        this.changeFileReactionDisposer = reaction(
            () => filesStore.currentFile,
            () => {
                if (!this.isDisposed && this.editor) {
                    this.restoreModel();
                }
            }
        );

        this.setDeltaDecorationsDisposer = reaction(
            () => ({ running: testsStore.running, file: filesStore.currentFile }),
            ({ running, file }) => {
                if (this.isDisposed || !this.editor || !file) return;

                if (file.type === FILE_TYPE.JAVA_SCRIPT) {
                    const range = this.getDecorationsRange(file);
                    this.setDeltaDecorations(file.id, range, running);
                }
            }
        );
    };

    private setDeltaDecorations = (fileId: string, ranges: monaco.IRange[], running: boolean) => {
        if (ranges.length === 0) return;

        const getClassName = (line: number) => {
            if (running) return styles.myGlyphMarginClass_runned;
            return styles.myGlyphMarginClass_ready;
        };

        this.deltaDecorations = this.editor!.deltaDecorations(
            this.deltaDecorations,
            ranges.map(range => ({
                range,
                options: { glyphMarginClassName: getClassName(range.startLineNumber) }
            }))
        );
    };

    private getDecorationsRange(file = this.props.filesStore!.currentFile): monaco.IRange[] {
        if (file?.type === FILE_TYPE.JAVA_SCRIPT && this.editor) {
            return file.info.parsingResult.map(({ identifierRange }) => identifierRange);
        }
        return [];
    };

    private handleMouseDown = (e: monaco.editor.IEditorMouseEvent) => {
        const file = this.props.filesStore!.currentFile;
        const testsStore = this.props.testsStore!;

        let status: string | null = null;
        if (e.target.element!.className.includes('myGlyphMarginClass_runned')) status = 'runned';
        if (e.target.element!.className.includes('myGlyphMarginClass_ready')) status = 'ready';

        if (!file || file.type !== FILE_TYPE.JAVA_SCRIPT || !e.target.element || !e.target.position || !status) return;

        const testParsingData = file.info.parsingResult
            .find(({ identifierRange: { startLineNumber: row } }) => row === e.target.position!.lineNumber);
        if (!testParsingData) return;

        if (status === 'runned') {
            testsStore.stopTest();
        } else if (status === 'ready') {
            testsStore.runTest(file, testParsingData.fullTitle).then(() => {
                this.setDeltaDecorations(file.id, this.getDecorationsRange(file), true);
                this.props.uiStore!.replsPanel.activeTab = 'Tests';

                const dispose = reaction(() => testsStore.running, (isRunning) => {
                    if (!isRunning) {
                        this.setDeltaDecorations(file.id, this.getDecorationsRange(file), false);
                        dispose();
                    }
                });
            });
        }
    };

    private findAction = () => this.editor?.getAction('actions.find')?.run();

    private updateTheme = (theme: string) => {
        this.monaco?.editor.setTheme(theme === 'dark' ? DARK_THEME_ID : DEFAULT_THEME_ID);
    };

    private saveViewState = () => {
        const viewState = this.editor!.saveViewState();
        const activeTab = this.props.tabsStore!.activeTab;
        if (viewState && activeTab?.type === TAB_TYPE.EDITOR) {
            (activeTab as any).viewState = viewState;
        }
    };

    private restoreViewState = () => {
        const activeTab = this.props.tabsStore!.activeTab;
        if (activeTab?.type === TAB_TYPE.EDITOR && (activeTab as any).viewState) {
            this.editor!.restoreViewState((activeTab as any).viewState);
        }
    };

    private subscribeToComponentsMediator() {
        mediator.subscribe(EVENTS.OPEN_SEARCH_BAR, this.findAction);
        mediator.subscribe(EVENTS.UPDATE_THEME, this.updateTheme);
        mediator.subscribe(EVENTS.SAVE_VIEW_STATE, this.saveViewState);
        mediator.subscribe(EVENTS.RESTORE_VIEW_STATE, this.restoreViewState);
    }

    private unsubscribeToComponentsMediator() {
        mediator.unsubscribe(EVENTS.OPEN_SEARCH_BAR, this.findAction);
        mediator.unsubscribe(EVENTS.UPDATE_THEME, this.updateTheme);
        mediator.unsubscribe(EVENTS.SAVE_VIEW_STATE, this.saveViewState);
        mediator.unsubscribe(EVENTS.RESTORE_VIEW_STATE, this.restoreViewState);
    }

    public render() {
        const file = this.props.filesStore!.currentFile;
        if (!file) return null;

        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            glyphMargin: file.type === FILE_TYPE.JAVA_SCRIPT,
            autoClosingBrackets: 'always',
            readOnly: file.readonly,
            minimap: { enabled: false },
            contextmenu: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            acceptSuggestionOnEnter: 'on',
            fontSize: this.props.uiStore!.editorSettings.fontSize,
        };

        const language = file.type === FILE_TYPE.RIDE ? 'ride' :
            file.type === FILE_TYPE.JAVA_SCRIPT ? 'javascript' : 'plaintext';

        return (
            <div className={styles.root}>
                <ResizeDetector
                    handleWidth
                    handleHeight
                    render={({ width, height }) => (
                        <MonacoEditor
                            key={file.id}
                            width={width}
                            height={height}
                            language={language}
                            value={file.content}
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
