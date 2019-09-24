import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface IProps {
    name: string
    label?: string
    isError?: boolean
    onClick: () => void
}

const Tab = (props: IProps) => {
    return (
        <div className={styles.replTab} onClick={props.onClick}>
            <div className={styles.replTab_name}>{props.name}</div>
            {props.label && (
                <div className={cn(styles.replTab_label, {[styles.replTab_label_error]: props.isError})}>
                    {props.label}
                </div>
            )}
        </div>
    );
};

export default Tab;
