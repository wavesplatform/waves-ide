import { observer } from 'mobx-react';
import React from 'react';
import { testRunner } from '@services';
import styles from './styles.less';
import Icn from '@components/ReplsPanel/Tests/Icn';

@observer
export  default class StatusBar extends React.Component {
    render(): React.ReactNode {

        const {isRunning, info: {passes, testsCount}} = testRunner;

        let icon = <Icn type="default"/>;
        if (isRunning) icon =  <Icn type="progress"/>;
        else if (testsCount > 0 && passes === testsCount) icon =  <Icn type="success"/>;
        else if (testsCount > 0 && passes !== testsCount) icon = <Icn type="error"/>;

        return <div className={styles.tests_statusBar}>
            {icon}
            <div className={styles.tests_passedTitle}>Tests passed:</div>
            &nbsp;
            <div className={styles.tests_caption}>{passes} of {testsCount} tests</div>
        </div>;
    }
}
