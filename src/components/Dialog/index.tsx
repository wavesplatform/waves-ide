import React from 'react';
import Dialog from 'rc-dialog';
import styles from './styles.less';
import classNames = require('classnames');

interface IDialogProps {
    title?: string
    footer?: React.ReactNode
    onClose?: () => void
    className?: string
    width?: number
    height?: number
    children?: any
    visible?: boolean
}

export default (props: IDialogProps) =>
    <Dialog
        title={props.title}
        footer={props.footer}
        onClose={props.onClose}
        className={classNames(styles.root, props.className)}
        width={props.width}
        height={props.height}
        visible={props.visible}
    >
        {props.children}
    </Dialog>;
