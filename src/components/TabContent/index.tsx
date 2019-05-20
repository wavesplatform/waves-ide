import React from 'react';
import { inject, observer } from 'mobx-react';
import { TAB_TYPE, TabsStore } from '@stores';
import Editor from '@components/Editor/Editor';
import WelcomePage from '@src/components/WelcomePage';


interface IInjectedProps {
    tabsStore?: TabsStore
}
@inject('tabsStore')
@observer
export default class TabContent extends React.Component<IInjectedProps> {
    render(){
        const activeTab = this.props.tabsStore!.activeTab;

        if (activeTab == null) return <div/>;
        const content = {
            [TAB_TYPE.WELCOME]: <WelcomePage/>,
            [TAB_TYPE.EDITOR]: <Editor/>
        }[activeTab!.type];

        return <>{content}</>;
    }
}
