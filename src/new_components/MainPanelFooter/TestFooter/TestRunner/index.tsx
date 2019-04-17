import React from 'react';
import { inject, observer } from 'mobx-react';
import { testRunner } from '@services';
import { FilesStore, IJSFile, SettingsStore } from '@stores';

// import TestTree from '../TestTree';

import styles from './styles.less';
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

    // private renderTestTree = () => {
    //     const {file} = this.props;
    //
    //     const fileInfo = file.info;
    //
    //     if (fileInfo && !('error' in fileInfo.compilation)) {
    //         return (
    //             <TestTree compilationResult={fileInfo.compilation.result.suite}/>
    //         );
    //     }
    //
    //     return;
    // };

    render() {
        const {file} = this.props;
        const fileInfo = file.info;
        const isRunning = testRunner.isRunning;
        let isCompiled = fileInfo && !('error' in fileInfo.compilation);
        return (
            <div className={styles.testRunner}>

                <Button
                    type="action-blue"
                    isDropdown={true}
                    dropdownData={
                        [
                            <div key={1} onClick={() => alert('test1')}>test1</div>,
                            <div key={2} onClick={() => alert('test2')}>test2</div>
                        ]}
                    // placement={'topRight'}
                    disabled={!isCompiled || isRunning}
                    // overlay={isCompiled ? this.renderTestTree() : null}
                    // overlay={null}
                    onClick={this.handleRunTest(file.content)}
                >
                    Run full test
                </Button>
            </div>
        );
    }
}
