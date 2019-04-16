import React from 'react';
import classNames from 'classnames';
import styles from './styles.less';


interface IButtonProps {
    type?: 'action-blue' | 'action-white' | 'add-block' | 'action-gray'
    className?: string
    children?: any
    onClick?: () => void
    disabled?: boolean
}

export default class Button extends React.Component<IButtonProps> {
    render() {
        const {type, className, children, onClick, disabled} = this.props;
        return <button
            className={classNames(styles.btn, styles['btn-' + (type || 'action-white')], className)}
            onClick={onClick}
            disabled={disabled}
        >
            {type === 'action-gray' && <div className="copy-18-basic-700"/>}{children}
        </button>;
    }
}
