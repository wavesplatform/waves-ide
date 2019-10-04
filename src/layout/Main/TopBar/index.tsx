import React from 'react';
import styles from './styles.less';
import TabsContainer from './Tabs';
import Accounts from './Accounts';
import SettingsBtn from './Settings';

const TopBar = () =>
    <div className={styles.root}>
        <TabsContainer className={styles.tabs}/>
        <Accounts className={styles.account}/>
        <SettingsBtn className={styles.settings}/>
    </div>;

export default TopBar;
