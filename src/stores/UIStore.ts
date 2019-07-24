import { action, observable, set } from 'mobx';

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

const isResizableState = (val: any): val is IResizableState => 'size' in val && 'isOpened' in val;

class UIStore extends SubStore {
    resizables: { [key: string]: IResizableState } = observable({
        repl: {
            size: 200,
            isOpened: true,
        },
        explorer: {
            size: 300,
            isOpened: true
        },
        testExplorer: {
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

    @action
    toggleTab(tab: 'blockchainRepl' | 'compilationRepl' | 'testRepl') {
        if (!this.resizables.repl.isOpened) {
            this.resizables.repl.isOpened = true;
        } else if (this.resizables.repl.isOpened && this.replsPanel.activeTab === tab) {
            this.resizables.repl.isOpened = false;
        }
        this.replsPanel.activeTab = tab;
    }

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);

        if (initState != null) {

            if (initState.resizables != null) {
                const values: { [key: string]: IResizableState } = {};
                Object.entries(this.resizables).forEach(([key, {size, isOpened}]) => {
                    let value = {size, isOpened};
                    if (initState.resizables[key] && isResizableState(initState.resizables[key])) {
                        value = { size: initState.resizables[key].size, isOpened: initState.resizables[key].isOpened};
                    }
                    values[key] = value;
                });
                set(this.resizables, values);
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
