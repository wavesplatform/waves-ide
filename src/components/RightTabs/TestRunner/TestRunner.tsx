import React from 'react';
import Button from '@material-ui/core/Button';
import { runTest } from '@utils/testRunner';
import { inject, observer } from 'mobx-react';
import { RootStore } from '@src/mobx-store';
import { StyledComponentProps } from '@material-ui/core';
import styles from './styles';

interface IInjectedProps {
    test?: string
}

interface ITestRunnerProps extends IInjectedProps, StyledComponentProps<keyof ReturnType<typeof styles>> {
}

@inject((store: RootStore) => ({
    test: store.filesStore.currentFile
}))
@observer
class TestRunner extends React.Component<ITestRunnerProps> {
    private handleRunTest = () => {
        const {test} = this.props;
        if (test) runTest(test);
    };

    public render() {
        const {classes} = this.props;

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
