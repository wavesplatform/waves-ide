import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { Intro } from '@components/intro';
import LogoIcon from '@components/icons/Logo';

import TabsContainer from '@src/new_components/Tabs';
import TabContent from '@src/new_components/TabContent';
import Explorer from '@src/new_components/Explorer';
import SidePanelFooter from '@src/new_components/SidePanelFooter';
import SidePanelResizableWrapper from '@src/new_components/SidePanelResizableWrapper';
import MainPanelFooter from '@src/new_components/MainPanelFooter';

import { FilesStore } from '@stores';

import styles from './styles.less';
import NewFileBtn from '@src/new_components/NewFileBtn';
import SettingsBtn from '@src/SettingsBtn';


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
                    <SidePanelResizableWrapper>
                        <div className={styles.sidePanel_header}>
                            <LogoIcon/>
                        </div>

                        <div className={styles.sidePanel_content}>
                            <Explorer/>
                        </div>

                        <div className={styles.sidePanel_footer}>
                            <SidePanelFooter/>
                        </div>
                    </SidePanelResizableWrapper>
                </div>

                <div className={styles.mainPanel}>

                    <div className={styles.mainPanel_header}>
                        <TabsContainer className={styles.mainPanel_tabs}/>
                        <NewFileBtn/>
                        <div className={styles.mainPanel_account}>
                            account
                        </div>
                        <div className={styles.mainPanel_settings}>
                            <SettingsButton/>
                        </div>
                    </div>

                    <div className={styles.mainPanel_content}>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <Intro/>
                        }
                    </div>

                    <MainPanelFooter className={styles.mainPanel_footer}/>
                </div>
            </div>
        );
    }
}
