import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/InkTabBar';

import ReplWrapper from '@components/ReplWrapper';
import ReplsPanelResizableWrapper from '../ReplsPanelResizableWrapper';

import { TabsStore } from '@stores';

import 'rc-tabs/assets/index.css';
import styles from './styles.less';

interface IProps {
    tabsStore?: TabsStore
    className?: string
}

const ReplTab = (props: any) => {
    return (
        <>
            <div className={styles!.replTab_name}>{props.name}</div>
            <div className={styles!.replTab_counter}>{props.counter}</div>
        </>
    );
};

@inject('tabsStore')
@observer
export default class TabsContainer extends React.Component<IProps> {

    private handleChangeTab = (tab: string) => {
        // debugger;
    }

    render() {
        const {
            className: classNameProp
        } = this.props;

        return (
            <ReplsPanelResizableWrapper>
                <div className={classnames(classNameProp, styles!.root)}>
                    <Tabs
                        defaultActiveKey="blockchainRepl"
                        onChange={this.handleChangeTab}
                        renderTabBar={() => <InkTabBar/>}
                        renderTabContent={() => <TabContent/>}
                    >
                        <TabPane
                            forceRender={true}
                            key="blockchainRepl"
                            tab={<ReplTab name="Console" counter={0}/>}
                        >
                            <ReplWrapper theme="light" name="blockchainRepl"/>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="proplemsRepl"
                            tab={<ReplTab name="proplemsRepl" counter={0}/>}
                        >
                            <ReplWrapper theme="light" name="proplemsRepl"/>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="testRepl"
                            tab={<ReplTab name="testRepl" counter={0}/>}
                        >
                            <ReplWrapper theme="light" name="testRepl"/>
                        </TabPane>
                    </Tabs>
                </div>
            </ReplsPanelResizableWrapper>
        );
    }
}
