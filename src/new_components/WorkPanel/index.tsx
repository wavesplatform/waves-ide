import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { FilesStore } from '@stores';

import TabsContainer from '@src/new_components/Tabs';
import TabContent from '@src/new_components/TabContent';
import SidePanel from '@src/new_components/SidePanel';
import MainPanelFooter from '@src/new_components/MainPanelFooter';
import NewFileBtn from '@src/new_components/NewFileBtn';
import SettingsBtn from '@src/new_components/SettingsBtn';
import EditorTopBar from '@src/new_components/EditorTopBar';

import styles from './styles.less';
import Accounts from '@src/new_components/Accounts';
import WelcomePage from '@src/new_components/WelcomePage';

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
                        <NewFileBtn position="topBar"/>
                        <Accounts className={styles.mainPanel_account}/>
                        <SettingsBtn className={styles.mainPanel_settings}/>
                    </div>
                    <div className={styles.mainPanel_content}>
                        <EditorTopBar/>

                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <WelcomePage/>
                        }
                    </div>

                    {filesStore!.currentFile && <MainPanelFooter className={styles.mainPanel_footer}/>}
                </div>
            </div>
        );
    }
}


