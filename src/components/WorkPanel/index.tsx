import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { FilesStore } from '@stores';

import TabsContainer from '@src/components/Tabs';
import TabContent from '@src/components/TabContent';
import SidePanel from '@src/components/SidePanel';
import MainPanelFooter from '@src/components/MainPanelFooter';
import NewFileBtn from '@src/components/NewFileBtn';
import SettingsBtn from '@src/components/SettingsBtn';
import EditorTopBar from '@src/components/EditorTopBar';

import styles from './styles.less';
import Accounts from '@src/components/Accounts';
import WelcomePage from '@src/components/WelcomePage';

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
                <LeftPanel/>
                <div className={styles.mainPanel}>
                    <TopBar/>
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



const LeftPanel = () =>
    <div className={styles.sidePanel}>
        <SidePanel/>
    </div>;

const TopBar = () =>
    <div className={styles.mainPanel_header}>
        <TabsContainer className={styles.mainPanel_tabs}/>
        <NewFileBtn position="topBar"/>
        <Accounts className={styles.mainPanel_account}/>
        <SettingsBtn className={styles.mainPanel_settings}/>
    </div>;
