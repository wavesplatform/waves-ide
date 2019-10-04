import React from 'react';
import styles from './styles.less';
import TabsContainer from './Tabs';
import Accounts from './Accounts';
import SettingsBtn from './SettingsBtn';

const TopBar = () =>
    <div className={styles.root}>
        <TabsContainer className={styles.mainPanel_tabs}/>
        <Accounts className={styles.mainPanel_account}/>
        <SettingsBtn className={styles.mainPanel_settings}/>
    </div>;

export default TopBar;
