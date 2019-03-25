import * as React from 'react';
import {inject, observer} from 'mobx-react';

import {Intro} from '@components/intro';
import LogoIcon from '@components/icons/Logo';

import Explorer from '../Explorer';
import SidePanelFooter from '../SidePanelFooter';
import SidePanelResizableWrapper from '../SidePanelResizableWrapper';
import TopBar from '../TopBar';

import {FilesStore} from '@stores';

import styles from './styles.less';
import TabsContainer from '@src/new_components/Tabs';
import TabContent from '@src/new_components/TabContent';

interface IInjectedProps {
    filesStore?: FilesStore
}

interface IAppProps extends IInjectedProps {
}

@inject('filesStore')
@observer
class WorkPanel extends React.Component<IAppProps> {
    render() {
        const {
            filesStore
        } = this.props;

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
                        <div className={styles.mainPanel_account}>
                            account
                        </div>
                        <div className={styles.mainPanel_settings}>
                            settings
                        </div>
                    </div>

                    <TopBar/>
                    <div className={styles.mainPanel_content}>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <Intro/>
                        }
                    </div>


                    <div className={styles.mainPanel_footer}>
                        mainPanel_footer
                    </div>
                </div>
            </div>
        );
    }
}

export default WorkPanel;
