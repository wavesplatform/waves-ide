import React from 'react';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, TAB_TYPE, TabsStore } from '@stores';
import Editor from '@components/Editor';
import WelcomePage from '@src/components/WelcomePage';
import MarkdownViewer from '@components/MarkdownViewer';


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
            [TAB_TYPE.EDITOR]: <Editor/>,
            [TAB_TYPE.MARKDOWN]: activeTab.type !== TAB_TYPE.WELCOME && <MarkdownViewer fileId={activeTab.fileId}/>
        }[activeTab!.type];
        return <>{content}</>;
    }
}
