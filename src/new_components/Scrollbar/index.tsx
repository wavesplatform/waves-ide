import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import styles from './styles.less';
import classNames = require('classnames');

interface IScrollbarProps {
    children?: any
    className?: string
    suppressScrollX?: boolean
    suppressScrollY?: boolean
}

export default class Scrollbar extends React.Component<IScrollbarProps> {
    render() {
        const {children, className, suppressScrollX, suppressScrollY} = this.props;
        return <PerfectScrollbar
            className={classNames(styles.root, className)}
            option={{suppressScrollX, suppressScrollY}}
        >
            {children}
        </PerfectScrollbar>;
    }
}
