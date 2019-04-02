import React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';

import { runTest } from '@utils/testRunner';
import { FilesStore, SettingsStore, IJSFile } from '@stores';

import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style/css';

import TestTree from '../TestTree';

import styles from './styles';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
}

interface IProps extends IInjectedProps, StyledComponentProps<keyof ReturnType<typeof styles>> {
    file: IJSFile
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
            classes,
            file,
        } = this.props;

        const fileInfo = file.info;

        let isCompiled = 
            fileInfo && !('error' in fileInfo.compilation)
                ? true
                : false;

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
