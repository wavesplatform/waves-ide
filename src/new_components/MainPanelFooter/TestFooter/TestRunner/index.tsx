import React from 'react';
import { inject, observer } from 'mobx-react';
import testRunner from '@src/services/testRunner';
import { FilesStore, SettingsStore, IJSFile } from '@stores';
import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style/css';

import TestTree from '../TestTree';

import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
}

interface IProps extends IInjectedProps{
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
        const { file } = this.props;

        const fileInfo = file.info;

        if (fileInfo && !('error' in fileInfo.compilation)) {
            return (
                <TestTree compilationResult={fileInfo.compilation.result.suite}/>
            );
        }

        return;
    };

    render() {
        const {
            file,
        } = this.props;

        const fileInfo = file.info;

        let isCompiled = 
            fileInfo && !('error' in fileInfo.compilation)
                ? true
                : false;

        return (
            <div className={styles.testRunner}>

                <Dropdown.Button
                    placement={'topRight'}
                    disabled={!isCompiled}
                    overlay={isCompiled ? this.renderTestTree() : null}
                    onClick={this.handleRunTest(file.content)}
                >
                    Run full test
                </Dropdown.Button>
            </div>
        );
    }
}
