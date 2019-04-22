import React from 'react';
import { inject, observer } from 'mobx-react';
import { testRunner } from '@services';
import { FilesStore, IJSFile, SettingsStore, UIStore } from '@stores';

import TestTree from '../TestTree';

import Button from '@src/new_components/Button';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
    file: IJSFile
}

interface IState {
}

@inject('filesStore', 'settingsStore', 'uiStore')
@observer
export default class TestRunner extends React.Component<IProps, IState> {
    private handleRunTest = () => {
        const {file, filesStore, uiStore} = this.props;
        uiStore!.replsPanel.activeTab = 'testRepl';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();
        testRunner.runTest(file.content);
    };

    private renderTestTree = () => {
        const {file} = this.props;

        const fileInfo = file.info;

        if (fileInfo && !('error' in fileInfo.compilation)) {
            return <TestTree
                uiStore={this.props.uiStore}
                file={file.content}
                compilationResult={fileInfo.compilation.result.suite}/>;
        }
        return;
    };

    render() {
        const {file} = this.props;
        const fileInfo = file.info;
        const isRunning = testRunner.isRunning;
        let isCompiled = fileInfo && !('error' in fileInfo.compilation);
        return (
            <div>
                <Button
                    type="action-blue"
                    isDropdown={true}
                    dropdownData={this.renderTestTree() || <div/>}
                    disabled={!isCompiled || isRunning}
                    onClick={this.handleRunTest}
                >
                    Run full test
                </Button>
            </div>
        );
    }
}
