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
}

type TTab = IEditorTab | IWelcomeTab;

interface ITab {
    type: TAB_TYPE
    //active: boolean
}

interface IEditorTab extends ITab {
    type: TAB_TYPE.EDITOR,
    fileId: string,
    viewState?: monaco.editor.ICodeEditorViewState
    model: monaco.editor.ITextModel | null
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}

export type TTabInfo = {
    label: string
    type: string
};

class TabsStore extends SubStore {
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
    get tabsInfo(): TTabInfo[] {
        return this.tabs.map(tab => {
            if (tab.type === TAB_TYPE.WELCOME) return {label: 'Welcome', type: 'welcome'};

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
        this.setActiveModel();
        mediator.dispatch(EVENTS.RESTORE_VIEW_STATE);
    }

    private setActiveModel = () => {
        const tab = this.activeTab!;
        if (tab.type === TAB_TYPE.EDITOR && tab.model === null) tab.model = this.createModelByFileId(tab.fileId);
        mediator.dispatch(EVENTS.SET_ACTIVE_MODEL, tab);
    };

    private createModelByFileId = (fileId: string): monaco.editor.ITextModel | null => {
        const file = this.rootStore.filesStore!.fileById(fileId);
        if (!file) return null;
        return monaco!.editor.createModel(file.content, file.type === FILE_TYPE.JAVA_SCRIPT ? 'javascript' : 'ride');
    };

    @action
    closeTab(i: number) {
        this.tabs.splice(i, 1);
        if (this.activeTabIndex >= i) this.activeTabIndex -= 1;
        if (this.activeTabIndex < 0) this.activeTabIndex = 0;
    }

    @action
    openFile(fileId: string) {
        const openedFileTabIndex = this.tabs.findIndex(t => t.type === TAB_TYPE.EDITOR && t.fileId === fileId);
        if (openedFileTabIndex > -1) {
            this.selectTab(openedFileTabIndex);
        } else {
            this.addTab({type: TAB_TYPE.EDITOR, fileId, model: null});
            this.activeTabIndex = this.tabs.length - 1;
        }
    }

    public serialize = () => ({
        tabs: this.tabs.map(tab => tab.type === TAB_TYPE.EDITOR ? {...tab, model: null} : tab),
        activeTabIndex: this.activeTabIndex
    });


}

export {
    TabsStore,
    TAB_TYPE,
    TTab,
    ITab,
    IEditorTab,
    IWelcomeTab
};
