import React from 'react';
import Button from '@material-ui/core/Button';
import { compileTest, runTest, updateTest } from '@utils/testRunner';
import { inject, observer } from 'mobx-react';
import { RootStore, SettingsStore } from '@src/mobx-store';
import { StyledComponentProps } from '@material-ui/core';

import Suite from './Suite';
import Test from './Test';

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

    render() {
        const { classes } = this.props;

        const { compilationResult, compilationIsValid } = this.state;

        return (
            <div className={classes!.testTab}>
                <div className={classes!.section}>
                    <Button
                        disabled={!compilationIsValid}
                        variant="contained"
                        fullWidth
                        children="Run full test"
                        color="primary"
                        onClick={this.handleRunTest}
                    />
                </div>

                <div className={classes!.section}>
                    {compilationIsValid &&  (
                            <div>
                                {compilationResult.tests.map((test: any, i: number) => (
                                    <Test
                                        key={i}
                                        title={test.title}
                                        fullTitle={test.fullTitle()}
                                    />
                                ))}

                                {compilationResult.suites.map((suite: any, i: number) => (
                                    <Suite
                                        key={i}
                                        title={suite.title}
                                        fullTitle={suite.fullTitle()}
                                        suites={suite.suites}
                                        tests={suite.tests}
                                    />
                                ))}
                            </div>
                        )}
                </div>
            </div>
        );
    }
}

export default TestRunner;
