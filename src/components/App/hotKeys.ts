import KeyboardService from '@utils/keyboardService';
import RootStore from '@stores/RootStore';
import { Mediator, TestRunner } from '@services';
import { FILE_TYPE } from '@stores';
import { History } from 'history';
import notification from 'rc-notification';
import { EVENTS } from '@components/Editor';

type TNotification = { notice: (arg0: { content: string; }) => void; };

export const hotKeysMap = {
    'Close tab': ['Meta', 'e'],
    'Run test or open Sign window': ['Shift', 'r'],
    'Settings': ['Shift', ','],
    'Account import window': ['Shift', 'Meta', 'i'],
    'New file': ['Alt', 'n'],
    'Open next tab': ['Alt', 'ArrowRight'],
    'Open previous tab': ['Alt', 'ArrowLeft'],
    'Increase font size': ['Shift', 'Alt', '='],
    'Decrease font size': ['Shift', 'Alt', '-'],
    'Change interface color': ['Meta', 'k'],
    'Open / Close explorer': ['Control', 'Meta', 'e'],
    'Open / Close Problems': ['Control', 'Meta', 'm'],
    'Open / Close Tests': ['Control', 'Meta', 't'],
    'Open / Close Console': ['Control', 'Meta', 'c'],

};

const subscribeHotkeys = (rootStore: RootStore, mediator: Mediator, history: History, testRunner: TestRunner) => {
    KeyboardService.subscribe(hotKeysMap['Close tab'], () => closeTab(rootStore));
    KeyboardService.subscribe(hotKeysMap['Run test or open Sign window'], () => runTestOrDeploy(rootStore, testRunner));
    KeyboardService.subscribe(hotKeysMap.Settings, () => openSettings(history));
    KeyboardService.subscribe(hotKeysMap['Account import window'], () => openImportAccount(history));
    KeyboardService.subscribe(hotKeysMap['New file'], () => createNewFile(rootStore));
    KeyboardService.subscribe(hotKeysMap['Open next tab'], () => openNextTab(rootStore));
    KeyboardService.subscribe(hotKeysMap['Open previous tab'], () => openPreviousTab(rootStore));

    KeyboardService.subscribe(hotKeysMap['Increase font size'], () => increaseFontSize(rootStore));
    KeyboardService.subscribe(hotKeysMap['Decrease font size'], () => decreaseFontSize(rootStore));
    KeyboardService.subscribe(hotKeysMap['Change interface color'], () => changeTheme(rootStore, mediator));
    KeyboardService.subscribe(hotKeysMap['Open / Close explorer'], () => toggleExplorer(rootStore));
    //toggleProblems
    KeyboardService.subscribe(hotKeysMap['Open / Close Problems'], () => toggleRepl(rootStore, 'compilationRepl'));
    //toggleTests
    KeyboardService.subscribe(hotKeysMap['Open / Close Tests'], () => toggleRepl(rootStore, 'testRepl'));
    //toggleConsole
    KeyboardService.subscribe(hotKeysMap['Open / Close Console'], () => toggleRepl(rootStore, 'blockchainRepl'));
};

const toggleExplorer = ({uiStore}: RootStore) => {
    const {isOpened} = uiStore.resizables.right;
    uiStore.resizables.right.isOpened = !isOpened;
};
const toggleRepl = ({uiStore}: RootStore, tab: 'blockchainRepl' | 'compilationRepl' | 'testRepl') => {
    if (!uiStore.resizables.top.isOpened) {
        uiStore.resizables.top.isOpened = true;
    } else if (uiStore.resizables.top.isOpened && uiStore.replsPanel.activeTab === tab) {
        uiStore.resizables.top.isOpened = false;
    }
    uiStore.replsPanel.activeTab = tab;
};


const closeTab = ({tabsStore}: RootStore) => {
    tabsStore.closeTab(tabsStore.activeTabIndex);
};

const runTestOrDeploy = ({filesStore, uiStore}: RootStore, testRunner: TestRunner) => {
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

const openSettings = (history: History) => {
    history.push('/settings');
};

const openNextTab = ({tabsStore}: RootStore) => {
    const i = tabsStore.activeTabIndex;
    if (i !== -1 && tabsStore.tabs.length - 1 !== i) tabsStore.selectTab(i + 1);
};

const openPreviousTab = ({tabsStore}: RootStore) => {
    const i = tabsStore.activeTabIndex;
    if (i > 0) tabsStore.selectTab(i - 1);
};

const changeTheme = ({uiStore}: RootStore, mediator: Mediator) => {
    const editor = uiStore!.editorSettings;
    editor.isDarkTheme = !editor.isDarkTheme;
    mediator.dispatch(EVENTS.UPDATE_THEME, editor.isDarkTheme);
};

const increaseFontSize = ({uiStore}: RootStore) => {
    const editor = uiStore!.editorSettings;
    editor.fontSize = editor.fontSize >= 20 ? 20 : editor.fontSize + 2;
    notification.newInstance({}, (notification: TNotification) => {
        notification.notice({content: `Font size is ${editor.fontSize} px`});
    });
};

const decreaseFontSize = ({uiStore}: RootStore) => {
    const editor = uiStore!.editorSettings;
    editor.fontSize = editor.fontSize <= 8 ? 8 : editor.fontSize - 2;
    notification.newInstance({}, (notification: TNotification) => {
        notification.notice({content: `Font size is ${editor.fontSize} px`});
    });
};


const openImportAccount = (history: History) => {
    history.push('/importAccount');
};

const createNewFile = ({filesStore}: RootStore) => {
    const content = '{-# STDLIB_VERSION 3 #-}\n' +
        '{-# CONTENT_TYPE DAPP #-}\n' +
        '{-# SCRIPT_TYPE ACCOUNT #-}';
    filesStore.createFile({type: FILE_TYPE.RIDE, content}, true);
};

export { subscribeHotkeys };
