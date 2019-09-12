import React from 'react';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { testRunner } from '@services';
import { FILE_TYPE, FilesStore, IJSFile, SettingsStore, UIStore } from '@stores';
import TestExplorer from '@components/ReplsPanel/Tests/TestExplorer';
import StatusBar from '@components/ReplsPanel/Tests/StatusBar';
import Icn from '@components/ReplsPanel/Tests/Icn';
import { ITestMessage } from '@utils/jsFileInfo';
import { action, observable } from 'mobx';
import { Line } from '@components/NewRepl/components/Line';
import Scrollbar from "@components/Scrollbar";

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
}


@inject('filesStore', 'settingsStore', 'uiStore')
@observer
export default class Tests extends React.Component<IProps> {

    @observable messages: ITestMessage[] | null = null;

    @action
    setTestOutput = (messages: ITestMessage[]) => {
        this.messages = messages;

    };

    private getFileFromTestRunner = (): IJSFile | null => {
        const file = testRunner.info.fileId ? this.props.filesStore!.fileById(testRunner.info.fileId) : null;
        if (file != null && file.type === FILE_TYPE.JAVA_SCRIPT) return file;
        return null;
    };


    private handleRerunFullTest = () => {
        const {uiStore, filesStore} = this.props;
        const file = this.getFileFromTestRunner();
        if (file == null) return;

        uiStore!.replsPanel.activeTab = 'testRepl';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();

        testRunner.runTest(file);
    };

    private handleStopTest = () => testRunner.isRunning && testRunner.stopTest();

    render(): React.ReactNode {
        const file = this.getFileFromTestRunner();
        const rootMessages = testRunner.info.tree ? testRunner.info.tree.messages || [] : [];
        return <div className={styles.root}>
            <div className={styles.tests_toolbar}>
                <Icn type="start" onClick={this.handleRerunFullTest} disabled={(testRunner.isRunning || file == null)}/>
                <Icn type="stop" onClick={this.handleStopTest} disabled={!testRunner.isRunning}/>
                <div className={styles.tests_passedTitle}>{testRunner.info.fileName || ''}</div>
            </div>
            <div className={styles.tests_body}>
                <TestExplorer
                    setTestOutput={this.setTestOutput}
                    tree={(testRunner.info.tree)}
                    minSize={150}
                    maxSize={600}
                    storeKey="testExplorer"
                    resizeSide={'right'}
                    disableClose
                />
                <div className={styles.tests_replPanel}>
                    <StatusBar/>
                    <Scrollbar>
                        {(this.messages || rootMessages).map(({message, type}, i) =>
                            <Line key={i} type="log" error={type === 'error'} value={message}/>
                        )}
                    </Scrollbar>
                </div>
            </div>
        </div>;
    }
}


