import RootStore from '../stores/RootStore';
import { Mediator, TestRunner } from '@services';
import { FILE_TYPE } from '@stores';
import { History } from 'history';
import { EVENTS } from '../components/Editor';
import { bindGlobal } from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import { NotificationService } from '@services/notificationService';

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

export enum platforms {
    win = 'Windows',
    linux = 'Linux',
    mac = 'MacIntel'
}


export class HotKeysService {

    rootStore: RootStore;
    mediator: Mediator;
    history: History;
    testRunner: TestRunner;
    notificationService: NotificationService;

    constructor(rootStore: RootStore, mediator: Mediator, history: History, testRunner: TestRunner,
                notificationService: NotificationService) {
        this.rootStore = rootStore;
        this.mediator = mediator;
        this.history = history;
        this.testRunner = testRunner;
        this.notificationService = notificationService;
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
        const {filesStore, uiStore, signerStore} = this.rootStore!;
        this.stopPropagation(e);
        if (!filesStore.currentFile) return;
        if (filesStore.currentFile.type === FILE_TYPE.RIDE) {
            const tx = signerStore.setScriptTemplate;
            if (tx) {
                signerStore!.setTxJson(tx);
                this.history!.push('/signer');
            }
        } else if (filesStore.currentFile.type === FILE_TYPE.JAVA_SCRIPT) {
            if (!testRunner.isRunning) {
                uiStore!.replsPanel.activeTab = 'testRepl';
                filesStore.currentDebouncedChangeFnForFile && filesStore.currentDebouncedChangeFnForFile.flush();
                testRunner.runTest(filesStore.currentFile);
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
        this.notificationService.notify(`Font size is ${editor.fontSize} px`, {key: 'editor-font-size'});
    };

    private decreaseFontSize = (e: ExtendedKeyboardEvent) => {
        this.stopPropagation(e);
        const {uiStore} = this.rootStore!;
        const editor = uiStore!.editorSettings;
        editor.fontSize = editor.fontSize <= 8 ? 8 : editor.fontSize - 2;
        this.notificationService.notify(`Font size is ${editor.fontSize} px`, {key: 'editor-font-size'});
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
        const {isOpened} = uiStore.resizables.explorer;
        uiStore.resizables.explorer.isOpened = !isOpened;
    };

    private toggleRepl = (tab: 'blockchainRepl' | 'compilationRepl' | 'testRepl') => {
        this.rootStore!.uiStore.toggleTab(tab);
    };

    public hotKeysMap: THotKeyMapItem[] =
        [
            {
                description: 'Close tab',
                macKeyMap: [keys.cmd, 'e'],
                winKeyMap: [keys.ctrl, 'q'],
                callback: this.closeTab
            },
            {
                description: 'Run test or open deploy DApp',
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
            // { //todo uncomment when will ready dark theme
            //     description: 'Change interface color',
            //     macKeyMap: [keys.cmd, 'k'],
            //     winKeyMap: [keys.ctrl, 'k'],//todo fix
            //     callback: this.changeTheme
            // },
            {
                description: 'Open / Close explorer',
                macKeyMap: [keys.alt, 'e'],
                winKeyMap: [keys.alt, 'e'],
                callback: this.toggleExplorer
            },
            {
                description: 'Open / Close Console',
                macKeyMap: [keys.alt, '1'],
                winKeyMap: [keys.alt, '1'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('blockchainRepl');
                }
            },
            {
                description: 'Open / Close Problems',
                macKeyMap: [keys.alt, '2'],
                winKeyMap: [keys.alt, '2'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('compilationRepl');
                }
            },
            {
                description: 'Open / Close Tests',
                macKeyMap: [keys.alt, '3'],
                winKeyMap: [keys.alt, '3'],
                callback: (e: ExtendedKeyboardEvent) => {
                    this.stopPropagation(e);
                    this.toggleRepl('testRepl');
                }
            },
        ];

    public subscribeHotkeys() {
        this.hotKeysMap.forEach(({macKeyMap, winKeyMap, callback}) =>
            bindGlobal(
                window.navigator.platform === platforms.mac
                    ? macKeyMap.join('+')
                    : winKeyMap.join('+')
                , callback
            ));
        //Easter eggs: for fatalities dial left right 1 plus enter enter
        bindGlobal('left right 1 = enter enter',
            () => this.notificationService.notify('SCORPION WINS! BRUTALITY!')
        );
    }


}
