import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { FILE_TYPE, FilesStore } from '@stores';

import TabsContainer from '@src/components/Tabs';
import TabContent from '@src/components/TabContent';
import SidePanel from '@src/components/SidePanel';
import MainPanelFooter from '@src/components/MainPanelFooter';
import SettingsBtn from '@src/components/SettingsBtn';
import EditorTopBar from '@src/components/EditorTopBar';

import styles from './styles.less';
import Accounts from '@src/components/Accounts';
import WelcomePage from '@src/components/WelcomePage';
import HotKeysPage from "@components/HotKeysPage";

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
                <SidePanel resizeSide="right"/>
                <div className={styles.mainPanel}>
                    <TopBar/>
                    <div className={styles.bottomBorder}/>
                    <div className={styles.mainPanel_content}>
                        <EditorTopBar/>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <WelcomePage/>
                        }
                    </div>
                    {
                        filesStore!.currentFile && filesStore!.currentFile.type !== FILE_TYPE.MARKDOWN &&
                        <MainPanelFooter className={styles.mainPanel_footer}/>
                    }
                </div>
            </div>
        );
    }
}


const TopBar = () =>
    <div className={styles.mainPanel_header}>
        <TabsContainer className={styles.mainPanel_tabs}/>
        <Accounts className={styles.mainPanel_account}/>
        <SettingsBtn className={styles.mainPanel_settings}/>
    </div>;
