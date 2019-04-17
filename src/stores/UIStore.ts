import { observable, set } from 'mobx';

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

interface IEditorSettings {
    fontSize: number
    isDarkTheme: boolean,
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

    editorSettings: IEditorSettings = observable({
        fontSize: 12,
        isDarkTheme: false
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

            set(this.editorSettings, {
                fontSize: initState.editorSettings.fontSize,
                isDarkTheme: initState.editorSettings.isDarkTheme
            });
        }
    }
}

export {
    UIStore,
    IReplsPanel,
    ISidePanel,
    IEditorSettings
};
