import React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';

import { runTest } from '@utils/testRunner';
import { FilesStore, SettingsStore } from '@stores';

import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style/css';

import TestTree from '../TestTree';

import styles from './styles';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
}

interface IProps extends IInjectedProps, StyledComponentProps<keyof ReturnType<typeof styles>> {
}

interface IState {
}

@inject('filesStore', 'settingsStore')
@observer
class TestRunner extends React.Component<IProps, IState> {    
    private handleRunTest = () => {
        runTest();	
    };
    
    private renderTestTree = () => {
        const { filesStore } = this.props;

        const fileInfo = filesStore!.currentFile!.info;

        if (fileInfo) { 
            return (
                <TestTree compilationResult={fileInfo.compilation.result.suite}/>
            );
        }
    };

    render() {
        const {
            classes,
            filesStore,
        } = this.props;

        const fileInfo = filesStore!.currentFile!.info;

        let isCompiled = false;

        if (fileInfo) {
            isCompiled = !('error' in fileInfo.compilation);
        }

        return (
            <div className={classes!.testRunner}>

                <Dropdown.Button
                    placement={'topRight'}
                    disabled={!isCompiled}
                    overlay={isCompiled ? this.renderTestTree() : null}
                    onClick={this.handleRunTest}
                >
                    Run full test
                </Dropdown.Button>
            </div>
        );
    }
}

export default withStyles(styles)(TestRunner);
