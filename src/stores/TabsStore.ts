import { action, computed, makeObservable, observable } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { FILE_TYPE } from '@stores';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { EVENTS } from '@src/layout/Main/TabContent/Editor';
import { mediator } from '@services';

enum TAB_TYPE {
    EDITOR,
    WELCOME,
    MARKDOWN,
    HOTKEYS
}

type TTab = IEditorTab | IWelcomeTab | IHotkeysTab | IMDTab;

interface ITab {
    type: TAB_TYPE
}

interface IEditorTab extends ITab {
    type: TAB_TYPE.EDITOR,
    fileId: string,
    viewState?: monaco.editor.ICodeEditorViewState
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}

interface IHotkeysTab extends ITab {
    type: TAB_TYPE.HOTKEYS
}

interface IMDTab extends ITab {
    type: TAB_TYPE.MARKDOWN
    fileId: string,
}

export type TTabInfo = {
    label: string
    type: string
};

class TabsStore extends SubStore {
    models: Record<string, monaco.editor.ITextModel> = {};
    @observable tabs: TTab[] = [];
    @observable activeTabIndex = -1;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        makeObservable(this);
        if (initState != null) {
            this.tabs = initState.tabs;
            this.activeTabIndex = initState.activeTabIndex;
        }
    }

    @computed
    get currentModel(): monaco.editor.ITextModel | null {
        if (this.activeTab && this.activeTab.type === TAB_TYPE.EDITOR) {
            const fileId = this.activeTab.fileId;

            if (!this.models[fileId]) {
                const file = this.rootStore.filesStore.fileById(fileId);
                if (file) {
                    const lang = file.type === FILE_TYPE.JAVA_SCRIPT ? 'javascript' : 'ride';
                    this.models[fileId] = monaco.editor.createModel(file.content, lang);
                }
            }

            const model = this.models[fileId];
            const file = this.rootStore.filesStore.fileById(fileId);
            if (model && file?.type === FILE_TYPE.RIDE && model.getLanguageId() !== 'ride') {
                monaco.editor.setModelLanguage(model, 'ride');
            }
            return model;
        }
        return null;
    }

    @computed
    get tabsInfo(): TTabInfo[] {
        return this.tabs.map(tab => {
            if (tab.type === TAB_TYPE.WELCOME) return {label: 'Welcome', type: 'welcome'};
            if (tab.type === TAB_TYPE.HOTKEYS) return {label: 'Hotkeys', type: 'hotkeys'};

            const file = this.rootStore.filesStore.fileById(tab.fileId);
            if (file) {
                return {
                    label: file.name,
                    type: file.type === FILE_TYPE.RIDE ? file.info.type : 'test'
                };
            }
            return {label: 'Unknown', type: 'unknown'};
        });
    }

    @computed
    get activeTab() {
        return this.tabs.length < 1
            ? undefined
            : this.tabs[this.activeTabIndex];
    }

    @action
    addTab(tab: TTab) {
        this.tabs.push(tab);
        this.selectTab(this.tabs.length - 1);
    }

    @action
    selectTab(i: number) {
        mediator.dispatch(EVENTS.SAVE_VIEW_STATE);
        this.activeTabIndex = i;
    }

    @action
    closeTab(i: number) {
        const tab = this.tabs[i];

        // Если это редакторный таб, отложим удаление модели
        if (tab && tab.type === TAB_TYPE.EDITOR) {
            const fileId = tab.fileId;
            const model = this.models[fileId];
            if (model && !model.isDisposed()) {
                // Откладываем удаление модели, чтобы дать завершиться асинхронным операциям
                setTimeout(() => {
                    if (model && !model.isDisposed()) {
                        model.dispose();
                    }
                }, 100);
            }
            delete this.models[fileId];
        }

        this.tabs.splice(i, 1);
        if (this.activeTabIndex >= i) this.activeTabIndex -= 1;
        if (this.activeTabIndex < 0 && this.tabs.length > 0) this.activeTabIndex = 0;
    }

    @action
    openTutorialTab(type: TAB_TYPE.HOTKEYS | TAB_TYPE.WELCOME) {
        const index = this.tabs.findIndex(tab => tab.type === type);
        if (index === -1) this.addTab({type: type});
        else this.selectTab(index);
    }

    isTutorialTab = (tab: TTab): tab is (IWelcomeTab | IHotkeysTab) =>
        tab.type === TAB_TYPE.WELCOME || tab.type === TAB_TYPE.HOTKEYS;

    @action
    openFile(fileId: string) {
        const openedFileTabIndex = this.tabs.findIndex(t => !this.isTutorialTab(t) && t.fileId === fileId);

        if (openedFileTabIndex > -1) {
            this.selectTab(openedFileTabIndex);
        } else {
            const file = this.rootStore.filesStore.fileById(fileId);
            if (file) {
                const type = (file.type === FILE_TYPE.MARKDOWN) ? TAB_TYPE.MARKDOWN : TAB_TYPE.EDITOR;
                this.addTab({type, fileId} as TTab);
            } else {
                console.error('[TabsStore] FILE NOT FOUND for id:', fileId);
            }
        }

        const currentFile = this.rootStore.filesStore.fileById(fileId);
        if (currentFile && currentFile.type === FILE_TYPE.RIDE) {
            void this.rootStore.filesStore.syncCurrentFileInfo(
                currentFile.isCompaction,
                currentFile.isRemoveUnusedCode
            );
        }
    }

    public serialize = () => ({
        tabs: this.tabs,
        activeTabIndex: this.activeTabIndex
    });
}

export {
    TabsStore,
    TAB_TYPE,
    TTab,
    ITab,
    IEditorTab,
    IWelcomeTab,
    IHotkeysTab
};
