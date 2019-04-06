import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { FilesStore } from '@stores';

import { Intro } from '@components/intro';
import { AccountsTab } from '@components/RightTabs/AccountsTab';

import TabsContainer from '@src/new_components/Tabs';
import TabContent from '@src/new_components/TabContent';
import SidePanel from '@src/new_components/SidePanel';
import MainPanelFooter from '@src/new_components/MainPanelFooter';
import NewFileBtn from '@src/new_components/NewFileBtn';
import SettingsBtn from '@src/new_components/SettingsBtn';
import EditorTopBar from '@src/new_components/EditorTopBar';

import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
export default class WorkPanel extends React.Component<IInjectedProps> {
    render() {
        const {filesStore} = this.props;

        return (
            <div className={styles.workPanel}>
                <div className={styles.sidePanel}>
                    <SidePanel/>
                </div>

                <div className={styles.mainPanel}>
                    <div className={styles.mainPanel_header}>
                        <TabsContainer className={styles.mainPanel_tabs}/>
                        <NewFileBtn/>
                        <div className={styles.mainPanel_account}>
                            Account
                        </div>
                        <SettingsBtn/>
                    </div>
                    <div className={styles.mainPanel_content}>
                        <AccountsTab></AccountsTab>
                        {/* <EditorTopBar/>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <Intro/>
                        } */}
                    </div>

                    <MainPanelFooter className={styles.mainPanel_footer}/>
                </div>
            </div>
        );
    }
}


