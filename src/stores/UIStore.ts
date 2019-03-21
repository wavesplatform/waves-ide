import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

interface IReplsPanel {
    height: number
    lastHeight: number
    isOpened: boolean
}

interface ISidePanel {
    width: number
    lastWidth: number
    lastDelta: number
    isOpened: boolean
}

class UIStore extends SubStore {
    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            this.replsPanel = initState.replsPanel;
            this.sidePanel = initState.sidePanel;
        }
    }

    replsPanel = observable({
        height: 200,
        get isOpened() {
            return this.height === 24
                ? false
                : true;
        }
    });

    sidePanel = observable({
        width: 300,
        get isOpened() {
            return this.width === 24
                ? false
                : true;
        }
    });


    @action
    updateSidePanel(width: number) {
        this.sidePanel.width = width;
    }

    @action
    updateReplsPanel(height: number) {
        this.replsPanel.height = height;
    }
}

export  {
    UIStore,
    IReplsPanel,
    ISidePanel
};
