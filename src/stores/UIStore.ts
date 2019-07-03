import { observable, set } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

interface IReplsPanel {
    activeTab: 'blockchainRepl' | 'compilationRepl' | 'testRepl'
}

interface IEditorSettings {
    fontSize: number
    isDarkTheme: boolean,
}

interface IResizableState {
    size: number
    isOpened: boolean
}

class UIStore extends SubStore {
    resizables: { [key: string]: IResizableState } = observable({
        top: {
            size: 200,
            isOpened: true,
        },

        right: {
            size: 300,
            isOpened: true
        }
    });

    replsPanel: IReplsPanel = observable({
        activeTab: 'blockchainRepl'
    });

    editorSettings: IEditorSettings = observable({
        fontSize: 12,
        isDarkTheme: false
    });


    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {

            if (initState.resizebles != null){
                set(this.resizables, {
                    top: {
                        ...this.resizables.top,
                        size: initState.resizebles.top.size,
                        isOpened: initState.resizebles.top.isOpened,
                    },
                    right: {
                        ...this.resizables.right,
                        size: initState.resizebles.right.size,
                        isOpened: initState.resizebles.right.isOpened,
                    }
                });
            }

            if (initState.replsPanel != null) {
                set(this.replsPanel, {
                    ...this.replsPanel,
                    activeTab: initState.replsPanel.activeTab
                });
            }

            if (initState.editorSettings != null) {
                set(this.editorSettings, {
                    ...this.editorSettings,
                    fontSize: initState.editorSettings.fontSize,
                    isDarkTheme: initState.editorSettings.isDarkTheme
                });
            }
        }
    }
}

export {
    UIStore,
    IReplsPanel,
    IEditorSettings,
    IResizableState
};
