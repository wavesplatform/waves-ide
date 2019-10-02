import { action, observable, set } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

export type TBottomTabKey = 'Console' | 'Compilation' | 'Tests' | 'RideREPL';

interface IReplsPanel {
    activeTab: TBottomTabKey
}

interface IEditorSettings {
    fontSize: number
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
        activeTab: 'Console'
    });

    editorSettings: IEditorSettings = observable({
        fontSize: 12
    });

    @action
    toggleTab(tab: TBottomTabKey) {
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
                    fontSize: initState.editorSettings.fontSize
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
