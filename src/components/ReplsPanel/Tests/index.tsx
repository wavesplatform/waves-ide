import React from 'react';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { testRunner } from '@services';
import { FILE_TYPE, FilesStore, IJSFile, SettingsStore, UIStore } from '@stores';
import TestExplorer from '@components/ReplsPanel/Tests/TestExplorer';
import StatusBar from '@components/ReplsPanel/Tests/StatusBar';
import Icn from '@components/ReplsPanel/Tests/Icn';
import Scrollbar from '@components/Scrollbar';
import { Line } from '@components/NewRepl/components/Line';

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

    private getFileFromTestRunner = (): IJSFile | null => {
        const file = testRunner.info.fileId ? this.props.filesStore!.fileById(testRunner.info.fileId) : null;
        if (file != null && file.type === FILE_TYPE.JAVA_SCRIPT) return file;
        return null;
    };

    private handleRerunFullTest = () => {
        const {uiStore, filesStore} = this.props;
        const file = this.getFileFromTestRunner();
        if (file == null) return;

        uiStore!.replsPanel.activeTab = 'Tests';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();
        testRunner.runTest(file);
    };

    private handleStopTest = () => testRunner.isRunning && testRunner.stopTest();

    render(): React.ReactNode {
        const file = this.getFileFromTestRunner();
        return <div className={styles.root}>
            <div className={styles.tests_toolbar}>
                <Icn type="start" onClick={this.handleRerunFullTest} disabled={(testRunner.isRunning || file == null)}/>
                <Icn type="stop" onClick={this.handleStopTest} disabled={!testRunner.isRunning}/>
                <div className={styles.tests_passedTitle}>{testRunner.info.fileName || ''}</div>
            </div>
            <div className={styles.tests_body}>
                <TestExplorer tree={testRunner.info.tree} minSize={150} maxSize={600} storeKey="testExplorer" resizeSide={'right'} disableClose/>
                <div className={styles.tests_replPanel}>
                    <StatusBar/>
                    <Scrollbar>
                        {testRunner.currentMessages.map(({message, type}, i) =>
                            <Line key={i} type="log" error={type === 'error'} value={message}/>
                        )}
                    </Scrollbar>
                </div>
            </div>
        </div>;
    }
}


