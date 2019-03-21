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

    @observable replsPanel: IReplsPanel = {
        height: 200,
        lastHeight: 200,
        isOpened: true,
    };

    @observable sidePanel: ISidePanel = {
        width: 300,
        lastWidth: 300,
        lastDelta: 0,
        isOpened: true
    };

    @action
    updateSidePanel(width: number, lastWidth: number, lastDelta: number, isOpened: boolean) {
        this.sidePanel = {
            width,
            lastWidth,
            lastDelta,
            isOpened
        };
    }

    @action
    updateReplsPanel(height: number, lastHeight: number, isOpened: boolean) {
        this.replsPanel = {
            height,
            lastHeight,
            isOpened
        };
    }
}

export  {
    UIStore,
    IReplsPanel,
    ISidePanel
};
