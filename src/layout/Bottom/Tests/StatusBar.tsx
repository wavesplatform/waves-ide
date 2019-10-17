import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.less';
import Icn from './Icn';

interface IProps {
    running: boolean
    passed: number
    total: number
}

const StatusBar: React.FC<IProps> = ({running, passed, total}) => {
    let icon = <Icn type="default"/>;
    if (running) {
        icon = <Icn type="progress"/>;
    } else if (total > 0 && passed === total) {
        icon = <Icn type="success"/>;
    } else if (total > 0 && passed !== total) icon = <Icn type="error"/>;

    return <div className={styles.tests_statusBar}>
        {icon}
        <div className={styles.tests_passedTitle}>Tests passed:</div>
        &nbsp;
        <div className={styles.tests_caption}>{passed} of {total} tests</div>
    </div>;
}

export default StatusBar
