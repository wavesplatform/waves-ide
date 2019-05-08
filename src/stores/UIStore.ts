import { observable, set } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

interface IReplsPanel {
    height: number
    isOpened: boolean,
    activeTab: 'blockchainRepl' | 'compilationRepl' | 'testRepl'
}

interface ISidePanel {
    width: number
    isOpened: boolean
}

interface IEditorSettings {
    fontSize: number
    isDarkTheme: boolean,
}

class UIStore extends SubStore {
    replsPanel: IReplsPanel = observable({
        height: 200,
        isOpened: true,
        activeTab: 'blockchainRepl'
    });

    sidePanel: ISidePanel = observable({
        width: 300,
        isOpened: true
    });

    editorSettings: IEditorSettings = observable({
        fontSize: 12,
        isDarkTheme: false
    });


    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {
            if (initState.replsPanel != null) {
                set(this.replsPanel, {
                    ...this.replsPanel,
                    height: initState.replsPanel.height,
                    isOpened: initState.replsPanel.isOpened,
                    activeTab: initState.replsPanel.activeTab
                });
            }

            if (initState.sidePanel != null) {
                set(this.sidePanel, {
                    ...this.sidePanel,
                    width: initState.sidePanel.width,
                    isOpened: initState.sidePanel.isOpened
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
    ISidePanel,
    IEditorSettings
};
