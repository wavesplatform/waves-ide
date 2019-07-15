import KeyboardService from '@utils/keyboardService';
import RootStore from '@stores/RootStore';
import { Mediator, TestRunner } from '@services';
import { TabsStore } from '@stores';

const subscribeHotkeys = (rootStore: RootStore, mediator: Mediator, history: History, testRunner: TestRunner) => {
    KeyboardService.subscribe(['Meta', 'e'], () => closeTab(rootStore.tabsStore));
    KeyboardService.subscribe(['Alt', 'r'], runTestOrDeploy);
    KeyboardService.subscribe(['Shift',  ','], () => openSettings(history));
    // KeyboardService.subscribe(['Shift', 'Meta', 'i'], this.alert);
    // KeyboardService.subscribe(['Alt', 'n'], this.alert);
    // KeyboardService.subscribe(['Alt', 'ArrowRight'], this.alert);
    // KeyboardService.subscribe(['Alt', 'ArrowLeft'], this.alert);
    //
    // KeyboardService.subscribe(['Alt', '+'], this.alert);
    // KeyboardService.subscribe(['Alt', '-'], this.alert);
    // KeyboardService.subscribe(['Meta', 'k'], this.alert);
};


const alert = () => {
    console.log('test')
}

const closeTab = (tabsStore: TabsStore) => {
    tabsStore.closeTab(tabsStore.activeTabIndex);
};

const runTestOrDeploy = () => {
    // console.log('ok')
    // console.log(this.props.filesStore!.currentFile)
    // if (!this.props.filesStore!.currentFile) return;
    // if (this.props.filesStore!.currentFile.type === FILE_TYPE.RIDE) return
    // if (this.props.filesStore!.currentFile.type === FILE_TYPE.JAVA_SCRIPT) {
    //     if (!testRunner.isRunning) {
    //         const {filesStore, uiStore} = this.props;
    //         uiStore!.replsPanel.activeTab = 'testRepl';
    //         filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();
    //         testRunner.runTest(filesStore!.currentFile!.content);
    //     }else {
    //         testRunner.stopTest();
    //     }
    // }
};
const openSettings = (history: any) => {
    console.log('TEST')
    history.push('/settings')
}

export { subscribeHotkeys };
