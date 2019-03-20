import React from 'react';
import EventListener from 'react-event-listener';
import './tabs.css';
import { inject, observer } from 'mobx-react';
import { TabsStore } from '@src/mobx-store';
import classname from 'classnames';
import debounce from 'debounce';
import { range } from '@utils/range';

const MIN_TAB_WIDTH = 100;

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
        return <div className={className}>
            <span  onClick={onClick}>{label}</span>
            <button onClick={onClose}>x</button>
        </div>;
    }
}

interface ITabsProps {
    children: React.ReactElement<ITabProps>[]
    availableWidth: number
}

export class Tabs extends React.Component<ITabsProps > {
    private prevVisibleTabs: number[] = [];
    private prevTabsWidth = 0;

    private getVisibleTabs(){
        const activeTabIndex = this.props.children.findIndex(tab => tab.props.active);
        if (activeTabIndex === -1) return this.prevVisibleTabs;

        let visibleTabs = [...this.prevVisibleTabs];
        let width = this.prevTabsWidth;

        while (!visibleTabs.includes(activeTabIndex) || width - MIN_TAB_WIDTH > 0 ) {
            if (!visibleTabs.includes(activeTabIndex)){
                const minIndex = Math.min(activeTabIndex, ...visibleTabs);
                const maxIndex = Math.max(activeTabIndex, ...visibleTabs) + 1;
                visibleTabs = range(minIndex, maxIndex);
                width = this.calculateWidth(visibleTabs);
                console.log(width)
                break;
            }
        }

        this.prevVisibleTabs = visibleTabs;
        this.prevTabsWidth = width;
        return visibleTabs;
    }

    private calculateWidth(tabIndexes: number[]){
        const ADD_WIDTH = 22;
        return tabIndexes.map(i => {
            const tabWidth = getTextWidth(this.props.children[i].props.label, '12px sans-serif') + ADD_WIDTH;
            return tabWidth > MIN_TAB_WIDTH ? tabWidth : MIN_TAB_WIDTH
        }).reduce((a, b) => a + b);
    }

    render() {
        const {availableWidth, children} = this.props;

        const visibleTabs = this.getVisibleTabs();

        //const maxVisibleTabs = Math.floor(availableWidth / 100);

        return <div ref={el => (window as any).ttabs = el} className={'tabs'}>{children.filter((_,i) => visibleTabs.includes(i))}</div>;
    }
}

@inject('tabsStore')
@observer
export default class extends React.Component<{ tabsStore?: TabsStore }, { availableWidth: number }> {

    private widthHelperEl = React.createRef<HTMLDivElement>();

    state = {
        availableWidth: 0
    };

    calculateAvailableWidth() {
        if (!this.widthHelperEl.current) return;
        //console.log(this.widthHelperEl.current.offsetWidth);
        this.setState({availableWidth: this.widthHelperEl.current.offsetWidth});
    }

    componentDidMount() {
        this.calculateAvailableWidth();
    }

    handleResize = debounce(this.calculateAvailableWidth.bind(this), 1000);

    componentWillUnmount() {
        this.handleResize.clear();
    }

    render() {
        const {tabsStore} = this.props;
        const {availableWidth} = this.state;

        return <React.Fragment>
            <div style={{width: '100%'}} ref={this.widthHelperEl}/>
            <EventListener target="window" onResize={this.handleResize}/>
            <Tabs availableWidth={availableWidth} children={tabsStore!.tabLabels.map((label, i) => (
                <Tab key={i}
                     active={i === tabsStore!.activeTabIndex}
                     label={label}
                     onClose={() => tabsStore!.closeTab(i)}
                     onClick={() => tabsStore!.selectTab(i)}
                />))}/>
        </React.Fragment>;
    }
}

const canvas = document.createElement('canvas');

function getTextWidth(text: string, font: string) {
    // re-use canvas object for better performance
    //const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

(window as any).getTextWidth = getTextWidth