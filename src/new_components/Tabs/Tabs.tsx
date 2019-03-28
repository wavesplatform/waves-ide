import React from 'react';
import Dropdown from 'rc-dropdown';
import Menu from 'rc-menu';
import styles from './styles.less';
import { range } from '@utils/range';
import { getTextWidth } from '@utils/getTextWidth';
import Tab, { ITabProps } from '@src/new_components/Tabs/Tab';

const MIN_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-min-width')
) || 150;
const MAX_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-max-width')
) || 240;
const HIDDEN_TAB_BTN_WIDTH = 85;

const TAB_FONT = '14px Roboto';

export interface ITabsProps {
    tabs: (ITabProps & { index: number })[]
    activeTabIndex: number
    availableWidth: number
}

export default class Tabs extends React.Component<ITabsProps> {
    private prevVisibleTabs: number[] = [];

    private _getNextTabToAdd(visibleTabs: number[]) {
        const nextIndex = Math.max(...visibleTabs) + 1;
        const prevIndex = Math.min(...visibleTabs) - 1;

        if (nextIndex > this.props.tabs.length - 1) {
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
        const {activeTabIndex, tabs} = this.props;
        if (activeTabIndex === -1) return this.prevVisibleTabs;
        const {availableWidth} = this.props;

        // console.log(tabs.map((_,i) => this.calculateTabWidth(i)));
        let visibleTabs = [...this.prevVisibleTabs];

        // Handle removed tabs
        while (visibleTabs[visibleTabs.length - 1] > tabs.length - 1) {
            visibleTabs.pop();
        }

        let width = this.calculateTabWidth(...visibleTabs);

        if (!visibleTabs.includes(activeTabIndex)) {
            const minIndex = Math.min(activeTabIndex, ...visibleTabs);
            const maxIndex = Math.max(activeTabIndex, ...visibleTabs) + 1;
            visibleTabs = range(minIndex, maxIndex);
            width = this.calculateTabWidth(...visibleTabs);
        }

        // Remove superfluous tabs
        let tabToRemove = this._getNextTabToRemove(visibleTabs, activeTabIndex);

        while (tabToRemove != null &&
        width > availableWidth - (visibleTabs.length === tabs.length ? 0 : HIDDEN_TAB_BTN_WIDTH)) {

            if (tabToRemove.index === visibleTabs[0]) {
                visibleTabs = visibleTabs.slice(1);
            } else {
                visibleTabs = visibleTabs.slice(0, visibleTabs.length - 1);
            }
            width -= tabToRemove.width;
            tabToRemove = this._getNextTabToRemove(visibleTabs, activeTabIndex);
        }

        // Add tabs if there is more place
        let tabToAdd = this._getNextTabToAdd(visibleTabs);
        while (tabToAdd != null &&
        width + tabToAdd.width < availableWidth - (visibleTabs.length === tabs.length - 1 ? 0 : HIDDEN_TAB_BTN_WIDTH)) {
            visibleTabs.push(tabToAdd.index);
            visibleTabs.sort( (a, b) => a - b);
            width += tabToAdd.width;
            tabToAdd = this._getNextTabToAdd(visibleTabs);

        }

        // console.log(visibleTabs)
        this.prevVisibleTabs = visibleTabs;
        return visibleTabs;
    }

    private calculateTabWidth(...tabIndexes: number[]) {
        const ADD_WIDTH = 2 * 24 /*c padding*/ + 2 * 8 /*t padding*/ + 16 /*icon*/ + 12 /*button*/ + 1 /*divisor*/;
        return tabIndexes.map(i => {
            const tab = this.props.tabs[i];
            if (tab == null) {
                console.error(`Calculate width error: failed to get tab with index ${i}`);
                return 0;
            }
            const label = tab.info.label;
            const tabWidth = getTextWidth(label, TAB_FONT) + ADD_WIDTH;
            // console.log(`${tab.info.label} - ${tabWidth}`)
            return tabWidth > MIN_TAB_WIDTH ?
                tabWidth > MAX_TAB_WIDTH ?
                    MAX_TAB_WIDTH :
                    tabWidth :
                MIN_TAB_WIDTH;
        }).reduce((a, b) => a + b, 0);
    }

    render() {
        const {tabs} = this.props;
        const visibleTabsIndexes = this.getVisibleTabsIndexes();
        const visibleChildren = tabs.filter((_, i) => visibleTabsIndexes.includes(i))
            .map(props => <Tab key={props.index} {...props}/>);
        const hiddenChildren = tabs.filter((_, i) => !visibleTabsIndexes.includes(i))
            .map(props => <Tab key={props.index} {...props}/>);

        return <div className={styles['tabs']}>
            <div className={styles['visible-tabs']}>
                {visibleChildren}
            </div>
            {hiddenChildren.length > 0 && <HiddenTabs>
                {hiddenChildren}
            </HiddenTabs>}
        </div>;
    }
}

interface IHiddenTabsProps {
    children: React.ReactElement<ITabProps>[]
}

const HiddenTabs: React.FunctionComponent<IHiddenTabsProps> = (props) => (
        <Dropdown overlay={<Menu>
                {props.children}
            </Menu>}
        >
            <div className={styles['hidden-tabs-btn']}>
                <div className={styles['hidden-tabs-btn-content-wrapper']}>
                    <div className={'list-12-basic-600'}/>
                    <div className={'body-3basic700left'}>{props.children.length}</div>
                </div>
            </div>
        </Dropdown>

);
