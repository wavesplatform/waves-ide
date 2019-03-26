import { observable, action, set } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

interface IReplsPanel {
    height: number
    isOpened: boolean
}

interface ISidePanel {
    width: number
    isOpened: boolean
}

class UIStore extends SubStore {
    replsPanel: IReplsPanel = observable({
        height: 200,
        get isOpened() {
            return this.height === 48
                ? false
                : true;
        }
    });
    
    sidePanel: ISidePanel = observable({
        width: 300,
        get isOpened() {
            return this.width === 24
                ? false
                : true;
        }
    });

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            set(this.replsPanel, {
                height: initState.replsPanel.height
            });

            set(this.sidePanel, {
                width: initState.sidePanel.height,
            });
        }
    }

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
