import { action, computed, observable } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { FILE_TYPE } from '@stores';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { EVENTS } from '@components/Editor';
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
    //active: boolean
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
                    const model = monaco.editor.createModel(file.content, lang);
                    // Since monaco has shared scope for all js models we should keep only 1 model at time
                    if (lang === 'javascript') {
                        Object.entries(this.models).forEach(([key, model]) => {
                            if (model.getModeId() === 'javascript') {
                                model.dispose();
                                delete this.models[key];
                            }
                        });
                    }
                    this.models[fileId] = model;
                }
            }

            return this.models[fileId];
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
        // Out of bound indices will not be tracked by MobX, need to check array length.
        // See https://github.com/mobxjs/mobx/issues/381,
        // https://github.com/
        // mobxjs/mobx/blob/gh-pages/docs/best/react.md#incorrect-access-out-of-bounds-indices-in-tracked-function
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
        this.tabs.splice(i, 1);
        if (this.activeTabIndex >= i) this.activeTabIndex -= 1;
        if (this.activeTabIndex < 0) this.activeTabIndex = 0;
    }

    isTutorialTab = (tab: TTab): tab is(IWelcomeTab | IHotkeysTab) =>
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
                this.addTab(({type, fileId} as TTab));
                this.activeTabIndex = this.tabs.length - 1;

            }
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


