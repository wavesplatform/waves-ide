import React from 'react';
import classname from 'classnames';
import styles from './styles.less';

export interface ITabProps {
    label: string
    active: boolean
    onClick?: () => void
    onClose?: () => void
}

export default class Tab extends React.Component<ITabProps> {
    render() {
        let className = styles.tab;
        if (this.props.active) className = classname(className, styles['active-tab']);

        const {onClick, onClose, label} = this.props;
        return <div className={className}>
            <div style={{border: '1px solid red', minWidth: 16, height: 16}}/>
            <span className={styles['tab-text']} onClick={onClick}>{label}</span>
            <button style={{width: 22}} onClick={onClose}>x</button>
        </div>;
    }
}
