import { inject, observer } from 'mobx-react';
import React from 'react';
import { TabsStore } from '@src/mobx-store';
import ReactResizeDetector from 'react-resize-detector';
import Tabs from './Tabs';
import Tab from './Tab';


interface IInjectedProps {
    tabsStore?: TabsStore
}

@inject('tabsStore')
@observer
export default class TabsContainer extends React.Component<IInjectedProps> {

    render() {
        const {tabsStore} = this.props;
        const activeTabIndex = tabsStore!.activeTabIndex;
        const tabLabels = tabsStore!.tabLabels;

        return (
            <ReactResizeDetector handleWidth
                                 refreshMode="throttle"
                                 refreshRate={200}
                                 render={({width}) => (
                                     <Tabs availableWidth={width}
                                           children={tabLabels.map((label, i) => (
                                               <Tab key={i}
                                                    active={i === activeTabIndex}
                                                    label={label}
                                                    onClose={() => tabsStore!.closeTab(i)}
                                                    onClick={() => tabsStore!.selectTab(i)}
                                               />))}/>
                                 )}
            />);
    }
}