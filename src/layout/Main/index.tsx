import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { FILE_TYPE, FilesStore } from '@stores';

import TabsContainer from './Tabs';
import TabContent from './TabContent';
import SidePanel from './SidePanel';
import MainPanelFooter from './MainPanelFooter';
import SettingsBtn from './SettingsBtn';
import EditorTopBar from './EditorTopBar';
import Accounts from './Accounts';
import WelcomePage from './TabContent/WelcomePage';

import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}


@inject('filesStore')
@observer
export default class Main extends React.Component<IInjectedProps> {
    render() {
        const {filesStore} = this.props;
        return (
            <div className={styles.workPanel}>
                <SidePanel storeKey="explorer" resizeSide="right" closedSize={24} minSize={225}/>
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
