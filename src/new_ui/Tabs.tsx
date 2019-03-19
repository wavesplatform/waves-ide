import React from 'react';
import EventListener from 'react-event-listener';
import './tabs.css';
import { inject, observer } from 'mobx-react';
import { TabsStore } from '@src/mobx-store';
import classname from 'classnames';
import debounce from 'debounce';

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

        const activeTab = children.findIndex(child => child.props.active);
        const maxVisibleTabs = Math.floor(availableWidth / 100);

        return <div ref={this.elemRef} className={'tabs'}>{children.slice(0, maxVisibleTabs)}</div>;
    }
}

@inject('tabsStore')
@observer
export default class extends React.Component<{ tabsStore?: TabsStore }, {availableWidth: number}> {

    private widthHelperEl = React.createRef<HTMLDivElement>();

    state = {
        availableWidth: 0
    };

    calculateAvailableWidth(){
        if (!this.widthHelperEl.current) return;
        console.log(this.widthHelperEl.current.offsetWidth);
        this.setState({availableWidth: this.widthHelperEl.current.offsetWidth});
    }

    componentDidMount(){
        this.calculateAvailableWidth()
    }


    handleResize = debounce(this.calculateAvailableWidth.bind(this), 1000);

    render() {
        const {tabsStore} = this.props;
        const {availableWidth} = this.state;

        return <React.Fragment>
            <div style={{width: '100%'}} ref={this.widthHelperEl}/>
            <EventListener target="window" onResize={this.handleResize}/>
            <Tabs availableWidth={availableWidth} children={tabsStore!.tabLabels.map((label, i) => <Tab key={i}
                                                                        active={i === tabsStore!.activeTabIndex}
                                                                        label={label}/>)}/>
        </React.Fragment>;
    }
}
