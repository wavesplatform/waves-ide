import React from 'react';
import Dialog from 'rc-dialog';
import styles from './styles.less';
import classNames = require('classnames');

interface IPopUpProps {
    title?: string
    footer?:  React.ReactNode
    onClose?: () => void
    className?: string
    width?: number
    height?: number
    children?: any
}

export default (props: IPopUpProps) =>
    <Dialog
        title={props.title}
        footer={props.footer}
        onClose={props.onClose}
        className={classNames(styles.root, props.className)}
        width={props.width}
        height={props.height}
        visible
    >
        {props.children}
    </Dialog>;
