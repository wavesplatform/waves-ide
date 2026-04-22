import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { TAB_TYPE, TabsStore } from '@stores';

import TabContent from './TabContent';
import MainPanelFooter from './MainPanelFooter';
import EditorTopBar from './EditorTopBar';
import WelcomePage from './TabContent/WelcomePage';
import TopBar from './TopBar';

import styles from './styles.less';

interface IInjectedProps {
    tabsStore?: TabsStore
}


@inject('tabsStore')
@observer
export default class Main extends React.Component<IInjectedProps> {
    render() {
        const {tabsStore} = this.props;
        const activeTab = tabsStore!.activeTab;

        // Вычисляем key только для редакторного таба
        let tabContentKey: string | undefined;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR && 'fileId' in activeTab) {
            tabContentKey = activeTab.fileId;
        }

        return <div className={styles.root}>
            <TopBar/>
            <div className={styles.border}/>
            <div className={styles.content}>
                <EditorTopBar/>
                {tabsStore!.tabs.length > 0
                    ? <TabContent key={tabContentKey} />
                    : <WelcomePage/>
                }
            </div>
            <MainPanelFooter className={styles.footer}/>
        </div>;
    }
}
