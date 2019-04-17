import React from 'react';
import { inject, observer } from 'mobx-react';
import { testRunner } from '@services';
import { FilesStore, IJSFile, SettingsStore } from '@stores';

import TestTree from '../TestTree';

import Button from '@src/new_components/Button';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
}

interface IProps extends IInjectedProps {
    file: IJSFile
}

interface IState {
}

@inject('filesStore', 'settingsStore')
@observer
export default class TestRunner extends React.Component<IProps, IState> {
    private handleRunTest = (test: string) => () => {
        testRunner.runTest(test);
    };

    private renderTestTree = () => {
        const {file} = this.props;

        const fileInfo = file.info;

        if (fileInfo && !('error' in fileInfo.compilation)) {
            return (
                <TestTree file={file.content} compilationResult={fileInfo.compilation.result.suite}/>
            );
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
                    onClick={this.handleRunTest(file.content)}
                >
                    Run full test
                </Button>
            </div>
        );
    }
}
