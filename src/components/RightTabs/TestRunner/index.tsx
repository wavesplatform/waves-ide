import React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';
import { Runner, Suite, Test } from 'mocha';

import { compileTest, runTest, updateTest } from '@utils/testRunner';
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

    // private compileTest = async (test?: string ) => { 
    //     if (!test) return;
            
    //     if (test === this.currentTest) return;

    //     this.currentTest = test;

    //     compileTest(test)
    //         .then((runner: Runner) => {
    //             updateTest(test);
                
    //             this.setState({
    //                 compilationIsValid: true,
    //                 compilationResult: runner.suite
    //             });
    //         })
    //         .catch(() => {
    //             this.setState({ compilationIsValid: false });
    //         });	
    // }	

    // static getDerivedStateFromProps(props: IProps, state: IState) {	
    //     if (props.test !== state.prevTest) {	
    //         return {
    //             compilationResult: null,
    //             compilationIsValid: false,
    //             prevTest: props.test
    //         };	
    //     }	

    //     return null;	
    // }	

    // componentDidMount() {	
    //     const { test } = this.props;

    //     this.compileTest(test);
    // }

    // componentDidUpdate() {	
    //     const { test } = this.props;
        
    //     const { compilationResult } = this.state;
        
    //     if (compilationResult === null) {
    //         this.compileTest(test);
    //     }
    // }

    private renderTestTree = () => {
        const { filesStore } = this.props;

        const fileInfo = filesStore!.currentFile!.info;

        return (
            fileInfo.isCompiled
                ? <TestTree compilationResult={fileInfo.compilation.suite}/>
                : <div></div>
        );
    };

    render() {
        const {
            classes,
            filesStore,
        } = this.props;

        const file = filesStore!.currentFile;

        return (
            <div className={classes!.testRunner}>
                <Dropdown.Button
                    placement={'topRight'}
                    disabled={!file.info.isCompiled}
                    overlay={this.renderTestTree()}
                    onClick={this.handleRunTest}
                >
                    Run full test
                </Dropdown.Button>
            </div>
        );
    }
}

export default withStyles(styles)(TestRunner);
