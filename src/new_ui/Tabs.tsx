import React from 'react';
import './tabs.css';
import { inject, observer } from 'mobx-react';
import { TabsStore } from '@src/mobx-store';
import classname from 'classnames';
import { range } from '@utils/range';
import ReactResizeDetector from 'react-resize-detector';

const MIN_TAB_WIDTH = 100;
const MAX_TAB_WIDTH = 150;
const HIDDEN_TAB_BTN_WIDTH = 25;

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
            <div style={{border: '1px solid red', minWidth: 16, height: 16}}/>
            <span className="tab-text" onClick={onClick}>{label}</span>
            <button onClick={onClose}>x</button>
        </div>;
    }
}

interface ITabsProps {
    children: React.ReactElement<ITabProps>[]
    availableWidth: number
}

export class Tabs extends React.Component<ITabsProps> {
    private prevVisibleTabs: number[] = [];
    private prevTabsWidth = 0;

    private _getNextTabToAdd(visibleTabs: number[]) {
        const nextIndex = Math.max(...visibleTabs) + 1;
        const prevIndex = Math.min(...visibleTabs) - 1;

        if (nextIndex > this.props.children.length - 1) {
            return prevIndex === -1 ? null : {index: prevIndex, width: this.calculateTabWidth(prevIndex)};
        }
        return {index: nextIndex, width: this.calculateTabWidth(nextIndex)};
    }

    private _getNextTabToRemove(visibleTabs: number[], activeTab: number) {
        const lastIndex = visibleTabs[visibleTabs.length - 1];
        const firstIndex = visibleTabs[0];

        if (visibleTabs.length === 1) return null;
        if (lastIndex !== activeTab) {
            return {index: lastIndex, width: this.calculateTabWidth(lastIndex)};
        }
        return {index: firstIndex, width: this.calculateTabWidth(firstIndex)};
    }

    private getVisibleTabsIndexes() {
        const activeTabIndex = this.props.children.findIndex(tab => tab.props.active);
        if (activeTabIndex === -1) return this.prevVisibleTabs;
        const {availableWidth} = this.props;


        let visibleTabs = [...this.prevVisibleTabs];

        // Handle removed tabs
        while(visibleTabs[visibleTabs.length -1] > this.props.children.length - 1){
            visibleTabs.pop();
        }

        let width = this.prevTabsWidth;

        if (!visibleTabs.includes(activeTabIndex)) {
            const minIndex = Math.min(activeTabIndex, ...visibleTabs);
            const maxIndex = Math.max(activeTabIndex, ...visibleTabs) + 1;
            visibleTabs = range(minIndex, maxIndex);
            width = this.calculateTabWidth(...visibleTabs);
            console.log(width);
        }
        console.log(visibleTabs);

        // Remove superfluous tabs
        let tabToRemove = this._getNextTabToRemove(visibleTabs, activeTabIndex);

        while (tabToRemove != null &&
        width > availableWidth - (visibleTabs.length === this.props.children.length ? 0 : HIDDEN_TAB_BTN_WIDTH)) {

            if (tabToRemove.index === visibleTabs[0]) {
                visibleTabs = visibleTabs.slice(1);
            } else {
                visibleTabs = visibleTabs.slice(0, visibleTabs.length - 1);
            }
            width -= tabToRemove.width;
            tabToRemove = this._getNextTabToRemove(visibleTabs, activeTabIndex);
        }

        // Add if there is more place
        let tabToAdd = this._getNextTabToAdd(visibleTabs);
        while (tabToAdd != null &&
        width + tabToAdd.width < availableWidth - (visibleTabs.length === this.props.children.length - 1 ? 0 : HIDDEN_TAB_BTN_WIDTH)) {
            visibleTabs.push(tabToAdd.index);
            visibleTabs.sort();
            width += tabToAdd.width;
            tabToAdd = this._getNextTabToAdd(visibleTabs);

        }

        this.prevVisibleTabs = visibleTabs;
        this.prevTabsWidth = width;
        return visibleTabs;
    }

    private calculateTabWidth(...tabIndexes: number[]) {
        const ADD_WIDTH = 18 /*icon*/ + 22 /*button*/ + 2/*border*/;
        return tabIndexes.map(i => {
            const tabWidth = getTextWidth(this.props.children[i].props.label, '12px sans-serif') + ADD_WIDTH;
            return tabWidth > MIN_TAB_WIDTH ?
                tabWidth > MAX_TAB_WIDTH ?
                    MAX_TAB_WIDTH :
                    tabWidth :
                MIN_TAB_WIDTH;
        }).reduce((a, b) => a + b, 0);
    }

    render() {
        const {children} = this.props;

        const visibleTabsIndexes = this.getVisibleTabsIndexes();
        const visibleChildren = children.filter((_, i) => visibleTabsIndexes.includes(i));
        const hiddenChildren = children.filter((_, i) => !visibleTabsIndexes.includes(i));

        return <div className="tabs-root">
            <div className="visible-tabs">
                {visibleChildren}
                {hiddenChildren.length > 0 && <HiddenTabs>
                    {hiddenChildren}
                </HiddenTabs>}
            </div>

        </div>;
    }
}

interface IHiddenTabsProps {
    children: React.ReactElement<ITabProps>[]
}

interface IHiddenTabsState {
    anchorEl: any
}

class HiddenTabs extends React.Component<IHiddenTabsProps, IHiddenTabsState> {
    state = {
        anchorEl: null
    };

    handleClick = (event: React.MouseEvent<{}>) => {
        //event.preventDefault();
        this.setState({anchorEl: event.currentTarget});
        console.log(this.state);
    };

    render() {
        return (
            <div className="hidden-tabs-btn"
                 onClick={this.handleClick}>
                ...{this.props.children.length}
            </div>
        );
    }
}

@inject('tabsStore')
@observer
export default class TabsContainer extends React.Component<{ tabsStore?: TabsStore }> {

    render() {
        const {tabsStore} = this.props;
        const activeTabIndex = tabsStore!.activeTabIndex;
        const tabLabels = tabsStore!.tabLabels;

        return (
            <ReactResizeDetector handleWidth
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
