import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import styles from './styles.less';
import classNames = require('classnames');

interface IScrollbarProps {
    children?: any
    className?: string
    onScrollX?: (ref: any) => void
    suppressScrollX?: boolean
    suppressScrollY?: boolean
    containerRef?: (ref: any) => void
}

export default class Scrollbar extends React.Component<IScrollbarProps> {
    render() {
        const {children, className, suppressScrollX, suppressScrollY, containerRef, onScrollX} = this.props;
        return <PerfectScrollbar
            containerRef={containerRef}
            onScrollX={onScrollX}
            className={classNames(styles.root, className)}
            option={{suppressScrollX, suppressScrollY, useBothWheelAxes: true, scrollYMarginOffset: 3}}
        >
            {children}
        </PerfectScrollbar>;
    }
}
