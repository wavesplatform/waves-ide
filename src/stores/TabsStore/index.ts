import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

import { TAB_TYPE, TTab } from '@src/types';

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

export default TabsStore;
