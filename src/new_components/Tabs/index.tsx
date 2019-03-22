import { inject, observer } from 'mobx-react';
import React from 'react';
import classnames from 'classnames';
import { TabsStore } from '@stores';
import ReactResizeDetector from 'react-resize-detector';
import Tabs from './Tabs';
import Tab from './Tab';


interface IInjectedProps {
    tabsStore?: TabsStore
}

@inject('tabsStore')
@observer
export default class TabsContainer extends React.Component<IInjectedProps & { className?: string }> {

    render() {
        const {tabsStore, className: classNameProp} = this.props;
        const activeTabIndex = tabsStore!.activeTabIndex;
        const tabLabels = tabsStore!.tabLabels;
        const className = classNameProp ? classnames(classNameProp) : undefined;

        return (<div style={{width: '100%'}} className={className}>
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
            />
        </div>);
    }
}