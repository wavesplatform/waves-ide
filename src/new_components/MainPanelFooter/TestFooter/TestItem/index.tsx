import React from 'react';
import withStyles, { StyledComponentProps } from 'react-jss';

import styles from './styles';

import { runTest } from '@utils/../../../../services/testRunner';

interface IProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
    type: 'suite' | 'test',
    title: string,
    fullTitle: string,
}

interface IState {}

class TestItem extends React.Component<IProps, IState> {
    render() {
        const {
            classes,
            type,
            title,
            fullTitle
        } = this.props;

        return (
            <div className={classes!.testItem}>
                <div
                    className={classes!.testItem_runBtn}
                    onClick={runTest.bind(null, fullTitle)}
                >
                    run
                </div>

                <div className={classes!.testItem_title}>
                    {`${type}: ${title}`}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(TestItem);
