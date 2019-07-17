import KeyboardService from '@utils/keyboardService';
import RootStore from '@stores/RootStore';
import { Mediator, TestRunner } from '@services';
import { FILE_TYPE } from '@stores';
import { History } from 'history';

const subscribeHotkeys = (rootStore: RootStore, mediator: Mediator, history: History, testRunner: TestRunner) => {
    KeyboardService.subscribe(['Meta', 'e'], () => closeTab(rootStore));
    KeyboardService.subscribe(['Shift', 'r'], () => runTestOrDeploy(rootStore, testRunner));
    KeyboardService.subscribe(['Shift', ','], () => openSettings(history));
    KeyboardService.subscribe(['Shift', 'Meta', 'i'], () => openImportAccount(history));
    // KeyboardService.subscribe(['Alt', 'n'], this.alert);
    // KeyboardService.subscribe(['Alt', 'ArrowRight'], this.alert);
    // KeyboardService.subscribe(['Alt', 'ArrowLeft'], this.alert);
    //
    // KeyboardService.subscribe(['Alt', '+'], this.alert);
    // KeyboardService.subscribe(['Alt', '-'], this.alert);
    // KeyboardService.subscribe(['Meta', 'k'], this.alert);
};


const log = () => {
    console.log('test');
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

const openImportAccount = (history: History) => {
    history.push('/settings');
};

export { subscribeHotkeys };
