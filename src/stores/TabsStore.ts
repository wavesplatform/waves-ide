import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

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
    fileId: string
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}


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
    get tabLabels() {
        return this.tabs.map(tab => {
            if (tab.type === TAB_TYPE.WELCOME) return 'Welcome';

            const file = this.rootStore.filesStore.fileById(tab.fileId);
            if (file) return file.name;
            return 'Unknown';
        });
    }

    @computed
    get activeTab() {
        return this.tabs[this.activeTabIndex];
    }

    @action
    addTab(tab: TTab) {
        this.tabs.push(tab);
        this.selectTab(this.tabs.length - 1);
    }

    @action
    selectTab(i: number) {
        this.activeTabIndex = i;
    }

    @action
    closeTab(i: number) {
        this.tabs.splice(i, 1);
        if (this.activeTabIndex >= i) this.activeTabIndex -= 1;
        if (this.activeTabIndex < 0) this.activeTabIndex = 0;
    }

    @action
    openFile(fileId: string) {
        const openedFileTabIndex = this.tabs.findIndex(t =>  t.type === TAB_TYPE.EDITOR && t.fileId === fileId);
        if (openedFileTabIndex > -1){
            this.selectTab(openedFileTabIndex);
        }else {
            this.addTab({type: TAB_TYPE.EDITOR, fileId});
            this.activeTabIndex = this.tabs.length - 1;
        }
    }
}

export { 
    TabsStore,
    TAB_TYPE,
    TTab,
    ITab,
    IEditorTab,
    IWelcomeTab
};
