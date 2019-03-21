import React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';

import { compileTest, runTest, updateTest } from '@utils/testRunner';
import { RootStore, SettingsStore } from '@stores';

import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style/css';

import TestTree from '../TestTree';

import styles from './styles';

interface IInjectedProps {
    test?: string,
    settingsStore?: SettingsStore
}

interface IProps extends IInjectedProps, StyledComponentProps<keyof ReturnType<typeof styles>> {
}

interface IState {
    prevTest: string | null,
    compilationResult: any,
    compilationIsValid: boolean
}

@inject((store: RootStore) => ({
    settingsStore: store.settingsStore,
    test: store.filesStore.currentFile && store.filesStore.currentFile.content
}))
@observer
class TestRunner extends React.Component<IProps, IState> {    
    state: IState = {	
        prevTest: null,
        compilationResult: null,
        compilationIsValid: false
    };

    private currentTest: string | null = null;

    private handleRunTest = () => {
        runTest();	
    };

    private compileTest = async (test?: string ) => { 
        if (!test) return;
            
        if (test === this.currentTest) return;

        this.currentTest = test;

        compileTest(test)
            .then((compilationResult) => {
                updateTest(test);
                
                this.setState({ compilationIsValid: true, compilationResult });
            })
            .catch(() => {
                this.setState({ compilationIsValid: false });
            });	
    }	

    static getDerivedStateFromProps(props: IProps, state: IState) {	
        if (props.test !== state.prevTest) {	
            return {
                compilationResult: null,
                compilationIsValid: false,
                prevTest: props.test
            };	
        }	

        return null;	
    }	

    componentDidMount() {	
        const { test } = this.props;

        this.compileTest(test);
    }

    componentDidUpdate() {	
        const { test } = this.props;
        
        const { compilationResult } = this.state;
        
        if (compilationResult === null) {
            this.compileTest(test);
        }
    }

    private renderTestTree = () => {
        const {
            compilationResult,
            compilationIsValid
        } = this.state;

        return (
            compilationIsValid
                ? <TestTree compilationResult={compilationResult}/>
                : <div></div>
        );
    };

    render() {
        const { classes } = this.props;

        console.dir(classes);

        const { compilationIsValid } = this.state;

        return (
            <div className={classes!.testRunner}>
                <Dropdown.Button
                    placement={'bottomRight'}
                    disabled={!compilationIsValid}
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
