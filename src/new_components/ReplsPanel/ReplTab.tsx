import React from 'react';

import styles from './styles.less';

interface IProps {
    name: string
    label?: string
    onClick: () => void
}

const ReplTab = (props: IProps) => {
    return (
        <div className={styles.replTab} onClick={props.onClick}>
            <div className={styles.replTab_name}>{props.name}</div>
            {props.label && (
                <div className={styles.replTab_label}>
                    {props.label}
                </div>
            )}
        </div>
    );
};

export default ReplTab;
