import RootStore from '@stores/RootStore';
import { Mediator, TestRunner } from '@services';
import { FILE_TYPE } from '@stores';
import { History } from 'history';
import notification from 'rc-notification';
import { EVENTS } from '@components/Editor';
import { bindGlobal } from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

type TNotification = { notice: (arg0: { content: string; }) => void; };

type THotKeyMapItem = {
    description: string
    macKeyMap: string[]
    winKeyMap: string[]
    callback: (e: ExtendedKeyboardEvent) => void
};

export enum keys {
    cmd = 'command',
    shift = 'shift',
    alt = 'alt',
    ctrl = 'ctrl',
    left = 'left',
    right = 'right',
    plus = '=',
}


export class HotKeys {

    rootStore: RootStore | null = null;
    mediator: Mediator | null = null;
    history: History | null = null;
    testRunner: TestRunner | null = null;

    constructor(rootStore: RootStore, mediator: Mediator, history: History, testRunner: TestRunner) {
        this.rootStore = rootStore;
        this.mediator = mediator;
        this.history = history;
        this.testRunner = testRunner;
    }

    private stopPropagation(e: ExtendedKeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    private closeTab = (e: ExtendedKeyboardEvent) => {
        e.stopPropagation();
        const {tabsStore} = this.rootStore!;
        tabsStore.closeTab(tabsStore.activeTabIndex);
    };

    private runTestOrDeploy = (e: ExtendedKeyboardEvent) => {
        const testRunner = this.testRunner!;
        const {filesStore, uiStore} = this.rootStore!;
        this.stopPropagation(e);
        alert('TODO make deploy handler');
        if (!filesStore.currentFile) return;
        if (filesStore.currentFile.type === FILE_TYPE.RIDE) return;
        if (filesStore.currentFile.type === FILE_TYPE.JAVA_SCRIPT) {
            if (!testRunner.isRunning) {
                uiStore!.replsPanel.activeTab = 'testRepl';
                filesStore.currentDebouncedChangeFnForFile && filesStore.currentDebouncedChangeFnForFile.flush();
                testRunner.runTest(filesStore.currentFile!.content);
            } else {
                testRunner.stopTest();
            }
        }
    };

    private openSettings = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        this.history!.push('/settings');
    };

    private openImportAccount = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        this.history!.push('/importAccount');
    };

    private createNewFile = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const content = '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE DAPP #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}';
        this.rootStore!.filesStore.createFile({type: FILE_TYPE.RIDE, content}, true);
    };

    private openNextTab = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {tabsStore} = this.rootStore!;
        const i = tabsStore.activeTabIndex;
        if (i !== -1 && tabsStore.tabs.length - 1 !== i) tabsStore.selectTab(i + 1);
    };

    private openPreviousTab = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {tabsStore} = this.rootStore!;
        const i = tabsStore.activeTabIndex;
        if (i > 0) tabsStore.selectTab(i - 1);
    };

    private increaseFontSize = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {uiStore} = this.rootStore!;
        const editor = uiStore!.editorSettings;
        editor.fontSize = editor.fontSize >= 20 ? 20 : editor.fontSize + 2;
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: `Font size is ${editor.fontSize} px`});
        });
    };

    private decreaseFontSize = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {uiStore} = this.rootStore!;
        const editor = uiStore!.editorSettings;
        editor.fontSize = editor.fontSize <= 8 ? 8 : editor.fontSize - 2;
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: `Font size is ${editor.fontSize} px`});
        });
    };

    private changeTheme = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const editor = this.rootStore!.uiStore.editorSettings;
        editor.isDarkTheme = !editor.isDarkTheme;
        this.mediator!.dispatch(EVENTS.UPDATE_THEME, editor.isDarkTheme);
    };

    private toggleExplorer = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {uiStore} = this.rootStore!;
        const {isOpened} = uiStore.resizables.right;
        uiStore.resizables.right.isOpened = !isOpened;
    };

    private toggleRepl = (tab: 'blockchainRepl' | 'compilationRepl' | 'testRepl') => {
        this.rootStore!.uiStore.toggleTab(tab);
    };

    public hotKeysMap: THotKeyMapItem[] =
        [
            {
                description: 'Close tab',
                macKeyMap: [keys.cmd, 'e'],
                winKeyMap: [keys.ctrl, 'e'],
                callback: this.closeTab
            },
            {
                description: 'Run test or open Sign window',
                macKeyMap: [keys.alt, 'r'],
                winKeyMap: [keys.alt, 'r'],
                callback: this.runTestOrDeploy
            },
            {
                description: 'Settings',
                macKeyMap: [keys.cmd, keys.shift, ','],
                winKeyMap: [keys.ctrl, keys.shift, ','],
                callback: this.openSettings
            },
            {
                description: 'Account import window',
                macKeyMap: [keys.cmd, keys.shift, 'i'],
                winKeyMap: [keys.ctrl, keys.shift, 'i'],
                callback: this.openImportAccount
            },
            {
                description: 'New file',
                macKeyMap: [keys.alt, 'n'],
                winKeyMap: [keys.alt, 'n'],
                callback: this.createNewFile
            },
            {
                description: 'Open next tab',
                macKeyMap: [keys.alt, keys.right],
                winKeyMap: [keys.alt, keys.right],
                callback: this.openNextTab
            },
            {
                description: 'Open previous tab',
                macKeyMap: [keys.alt, keys.left],
                winKeyMap: [keys.alt, keys.left],
                callback: this.openPreviousTab
            },
            {
                description: 'Increase font size',
                macKeyMap: [keys.cmd, keys.shift, keys.plus],
                winKeyMap: [keys.ctrl, keys.shift, keys.plus],
                callback: this.increaseFontSize
            },
            {
                description: 'Decrease font size',
                macKeyMap: [keys.cmd, keys.shift, '-'],
                winKeyMap: [keys.ctrl, keys.shift, '-'],
                callback: this.decreaseFontSize
            },
            {
                description: 'Change interface color',
                macKeyMap: [keys.cmd, 'k'],
                winKeyMap: [keys.ctrl, 'k'],
                callback: this.changeTheme
            },
            {
                description: 'Open / Close explorer',
                macKeyMap: [keys.alt, 'e'],
                winKeyMap: [keys.alt, 'e'],
                callback: this.toggleExplorer
            },
            {
                description: 'Open / Close Console',
                macKeyMap: [keys.alt,  '1'],
                winKeyMap: [keys.alt, '1'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('blockchainRepl');
                }
            },
            {
                description: 'Open / Close Problems',
                macKeyMap: [keys.alt,  '2'],
                winKeyMap: [keys.alt, '2'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('compilationRepl');
                }
            },
            {
                description: 'Open / Close Tests',
                macKeyMap: [keys.alt,  '3'],
                winKeyMap: [keys.alt, '3'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('testRepl');
                }
            },
        ];

    public subscribeHotkeys() {
        this.hotKeysMap.forEach(({macKeyMap, callback}) => bindGlobal(macKeyMap.join('+'), callback));
    }


}
