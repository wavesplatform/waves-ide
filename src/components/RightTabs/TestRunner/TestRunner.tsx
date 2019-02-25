import React from 'react';

import Button from '@material-ui/core/Button';

import { runTest } from '@utils/testRunner';

import { IProps, IState } from './types';

class TestRunner extends React.Component<IProps, IState> {
    private handleRunTest = () => {
        const { test } = this.props;

        runTest(test);
    };

    public render() {
        const { classes } = this.props;

        return (
            <div className={classes!.testTab}>
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
