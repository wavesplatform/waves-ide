import React from 'react';

import styles from './styles.less';

interface IProps {
    name: string
    onClick: () => void
    counter?: number
}

const ReplTab = (props: IProps) => {
    return (
        <div className={styles.replTab} onClick={props.onClick}>
            <div className={styles.replTab_name}>{props.name}</div>
            <div className={styles.replTab_counter}>
                {props.counter ? props.counter : 0}
            </div>
        </div>
    );
};

export default ReplTab;
