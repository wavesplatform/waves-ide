import React from 'react';
import EventListener from 'react-event-listener';
import './tabs.css';
import { inject, observer } from 'mobx-react';
import { TabsStore } from '@src/mobx-store';
import classname from 'classnames';
import debounce from 'debounce';
import ReactResizeDetector from 'react-resize-detector';

interface ITabProps {
    label: string
    active: boolean
    onClick?: () => void
    onClose?: () => void
}

class Tab extends React.Component<ITabProps> {
    render() {
        let className = 'tab';
        if (this.props.active) className = classname(className, 'active-tab');

        const {onClick, onClose, label} = this.props;
        return <div className={className} onClick={onClick}>
            <span>{label}</span>
            <button onClick={onClose}>x</button>
        </div>;
    }
}

interface ITabsProps {
    children: React.ReactElement<ITabProps>[]
    availableWidth: number
}

export class Tabs extends React.Component<ITabsProps> {

    private elemRef = React.createRef<HTMLDivElement>();

    render() {
        const {availableWidth, children} = this.props;
        console.log(availableWidth)
        const activeTab = children.findIndex(child => child.props.active);
        const maxVisibleTabs = Math.floor(availableWidth / 100);

        return <div ref={this.elemRef} className={'tabs'}>{children.slice(0, maxVisibleTabs)}</div>;
    }
}

@inject('tabsStore')
@observer
export default class extends React.Component<{ tabsStore?: TabsStore }, { availableWidth: number }> {

    render() {
        const {tabsStore} = this.props;

        return (
            <ReactResizeDetector
                handleWidth
                refreshMode="throttle"
                render={({width}) => (
                    <Tabs availableWidth={width}
                          children={tabsStore!.tabLabels.map((label, i) =>
                              <Tab key={i} active={i === tabsStore!.activeTabIndex} label={label}/>)}
                    />
                )}
            />)

    }
}
