import React from 'react';
import { inject, observer } from 'mobx-react';
import { TAB_TYPE, TabsStore } from '@stores';
import Editor from '@components/Editor/Editor';


interface IInjectedProps {
    tabsStore?: TabsStore
}
@inject('tabsStore')
@observer
export default class TabContent extends React.Component<IInjectedProps> {
    render(){
        const activeTab =  this.props.tabsStore!.activeTab;

        const content = {
            [TAB_TYPE.WELCOME]: <div>Welcome Placeholder</div>,
            [TAB_TYPE.EDITOR]: <Editor/>
        }[activeTab.type];

        return <>{content}</>;
    }
}
