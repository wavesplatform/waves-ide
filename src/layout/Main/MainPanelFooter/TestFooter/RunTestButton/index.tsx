import React from 'react';
import { inject, observer } from 'mobx-react';
import { FilesStore, IJSFile, SettingsStore, TestsStore, UIStore } from '@stores';

import Button from '@src/components/Button';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
    testsStore?: TestsStore
}

interface IProps extends IInjectedProps {
    file: IJSFile
}

interface IState {
}

@inject('filesStore', 'settingsStore', 'uiStore', 'testsStore')
@observer
export default class RunTestButton extends React.Component<IProps, IState> {
    private handleRunTest = () => {
        const {file, filesStore, uiStore, testsStore} = this.props;
        uiStore!.replsPanel.activeTab = 'Tests';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();

        testsStore!.runTest(file);
    };

    private handleStopTest = () => this.props.testsStore!.stopTest();

    render() {
        const {file, testsStore} = this.props;
        const fileInfo = file.info;
        const isCompiled = fileInfo && !('error' in fileInfo.compilation);
        const isRunning = testsStore!.running;

        if (isRunning && file.id !== testsStore!.fileId) {
            return <Button
                type="action-blue"
                disabled={true}
                onClick={this.handleRunTest}
            >
                Run full test
            </Button>;
        }

        return (
            <div>
                {isRunning
                    ? (
                        <Button
                            type="action-red"
                            disabled={!isCompiled}
                            onClick={this.handleStopTest}
                        >
                            Stop full test
                        </Button>
                    ) : (
                        <Button
                            type="action-blue"
                            disabled={!isCompiled || isRunning}
                            onClick={this.handleRunTest}
                        >
                            Run full test
                        </Button>
                    )
                }
            </div>
        );
    }
}
