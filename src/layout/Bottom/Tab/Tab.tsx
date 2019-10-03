import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface IProps {
    name: string
    active: boolean
    label?: string
    isError?: boolean
    onClick: () => void
}

const Tab = (props: IProps) => {
    return (
        <div className={cn(styles.root, {[styles.active]: props.active})} onClick={props.onClick}>
            <div className={styles.name}>{props.name}</div>
            {props.label && (
                <div className={cn(styles.label, {[styles.label_error]: props.isError})}>
                    {props.label}
                </div>
            )}
        </div>
    );
};

export default Tab;
