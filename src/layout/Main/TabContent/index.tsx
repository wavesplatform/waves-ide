import React from 'react';
import { inject, observer } from 'mobx-react';
import { TAB_TYPE, TabsStore } from '@stores';
import Editor from './Editor';
import WelcomePage from './WelcomePage';
import MarkdownViewer from './MarkdownViewer';
import HotKeysPage from './HotKeysPage';


interface IInjectedProps {
    tabsStore?: TabsStore
}

@inject('tabsStore')
@observer
export default class TabContent extends React.Component<IInjectedProps> {
    render() {
        const tabsStore = this.props.tabsStore!;
        const activeTab = tabsStore.activeTab;

        if (activeTab == null) return <div/>;
        const content = {
            [TAB_TYPE.WELCOME]: <WelcomePage/>,
            [TAB_TYPE.HOTKEYS]: <HotKeysPage/>,
            [TAB_TYPE.EDITOR]: <Editor/>,
            [TAB_TYPE.MARKDOWN]:  !tabsStore.isTutorialTab(activeTab) && <MarkdownViewer fileId={activeTab.fileId}/>
        }[activeTab!.type];
        return <>{content}</>;
    }
}
