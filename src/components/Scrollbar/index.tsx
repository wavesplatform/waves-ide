import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import styles from './styles.less';
import classNames = require('classnames');

interface IScrollbarProps {
    children?: any
    className?: string
    suppressScrollX?: boolean
    suppressScrollY?: boolean
    containerRef?: (ref: any) => void
}

export default class Scrollbar extends React.Component<IScrollbarProps> {
    render() {
        const {children, className, suppressScrollX, suppressScrollY, containerRef} = this.props;
        return <PerfectScrollbar
            containerRef={containerRef}
            className={classNames(styles.root, className)}
            option={{suppressScrollX, suppressScrollY, useBothWheelAxes: true}}
        >
            {children}
        </PerfectScrollbar>;
    }
}
