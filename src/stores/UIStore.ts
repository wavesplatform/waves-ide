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
        isOpened: true
    });
    
    sidePanel: ISidePanel = observable({
        width: 300,
        isOpened: true
    });

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            set(this.replsPanel, {
                height: initState.replsPanel.height,
                isOpened: initState.replsPanel.isOpened
            });

            set(this.sidePanel, {
                width: initState.sidePanel.width,
                isOpened: initState.sidePanel.isOpened
            });
        }
    }
}

export  {
    UIStore,
    IReplsPanel,
    ISidePanel
};
