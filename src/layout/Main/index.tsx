import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { TabsStore } from '@stores';

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
        return <div className={styles.root}>
            <TopBar/>
            <div className={styles.bottomBorder}/>
            <div className={styles.mainPanel_content}>
                <EditorTopBar/>
                {tabsStore!.tabs.length > 0 ? <TabContent/> : <WelcomePage/>}
            </div>
            <MainPanelFooter className={styles.mainPanel_footer}/>
        </div>;
    }
}

