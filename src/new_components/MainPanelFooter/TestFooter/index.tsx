import React from 'react';
import classNames from 'classnames';

import TestRunner from './TestRunner';

import styles from '../styles.less';

interface ITestFooterProps {
    className?: string
}

class TestFooter extends React.Component<ITestFooterProps> {
    render() {
        const { className } = this.props;

        const rootClassName = classNames(styles!.root, className);

        return (
            <div className={rootClassName}>
                <div className={styles.left}></div>
                <div className={styles.right}>
                    <TestRunner/>
                </div>
            </div>
        );
    }
}

export default TestFooter;
