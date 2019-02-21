import React from 'react';

import Button from '@material-ui/core/Button';

import { addTest, runTest } from '@utils/testsRunner';

import { IProps, IState } from './types';

class TestRunner extends React.Component<IProps, IState> {
    public state: IState = {
        prevTest: null
    };

    private currentTest: string | null = null;

    static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.test !== state.prevTest) {
            return {
                prevTest: props.test,
            };
        }

        return null;
    };

    private handleRunTest = () => {
        runTest();
    };

    private updateTest(test: string) {        
        if (test === this.currentTest) {
            return;
        }

        addTest(test);

        this.currentTest = test;
    }

    public componentDidMount() {
        const { test } = this.props;

        this.updateTest(test);
    }

    public componentDidUpdate() {
        const { test } = this.props;

        this.updateTest(test);
    }

    public render() {
        const { classes } = this.props;

        return (
            <div className={classes!.testTab}>
                <div className="testTab_results">
                </div>

                <Button
                    variant="contained"
                    fullWidth
                    children="Run test"
                    color="primary"
                    onClick={this.handleRunTest}
                />
            </div>
        );
    }
}

export default TestRunner;
