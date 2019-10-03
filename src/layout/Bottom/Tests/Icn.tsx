import React from 'react';
import styles from './styles.less';


interface IProps {
    type: 'start' | 'stop' | 'default' | 'progress' | 'success' | 'error'
    disabled?: boolean
    onClick?: () => void
}


export default class Icn extends React.Component<IProps> {
    render(): React.ReactNode {
        const {type, disabled, onClick} = this.props;

        return <div
            className={styles[`tests_${type}Icn${disabled ? '_disabled' : ''}`]}
            onClick={onClick}
        />;
    }
}
