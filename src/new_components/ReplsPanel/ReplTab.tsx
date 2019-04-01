import React from 'react';

import styles from './styles.less';

const ReplTab = (name: string, onClick: () => void, counter?: number) => {
    return (
        <div className={styles.replTab} onClick={onClick}>
            <div className={styles.replTab_name}>{name}</div>
            <div className={styles.replTab_counter}>{counter}</div>
        </div>
    );
};


export default ReplTab;
