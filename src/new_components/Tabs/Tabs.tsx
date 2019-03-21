import React from 'react';
import Dropdown from 'rc-dropdown';
import Menu from 'rc-menu';
import styles from './styles.less';
import { range } from '@utils/range';
import { getTextWidth } from '@utils/getTextWidth';
import { ITabProps } from '@src/new_components/Tabs/Tab';

const MIN_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--max-tab-width')
) || 100;
const MAX_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--min-tab-width')
) || 150;
const HIDDEN_TAB_BTN_WIDTH = 25;

const TAB_FONT = getComputedStyle(document.documentElement).getPropertyValue('--tab-component-text-font')
    || '12px sans-serif';

export interface ITabsProps {
    children: React.ReactElement<ITabProps>[]
    availableWidth: number
}

export default class Tabs extends React.Component<ITabsProps> {
    private prevVisibleTabs: number[] = [];

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
        while (visibleTabs[visibleTabs.length - 1] > this.props.children.length - 1) {
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
        width > availableWidth - (visibleTabs.length === this.props.children.length ? 0 : HIDDEN_TAB_BTN_WIDTH)) {

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
        width + tabToAdd.width < availableWidth - (visibleTabs.length === this.props.children.length - 1 ? 0 : HIDDEN_TAB_BTN_WIDTH)) {
            visibleTabs.push(tabToAdd.index);
            visibleTabs.sort();
            width += tabToAdd.width;
            tabToAdd = this._getNextTabToAdd(visibleTabs);

        }

        this.prevVisibleTabs = visibleTabs;
        return visibleTabs;
    }

    private calculateTabWidth(...tabIndexes: number[]) {
        const ADD_WIDTH = 18 /*icon*/ + 22 /*button*/ + 2/*border*/;
        return tabIndexes.map(i => {
            const tabWidth = getTextWidth(this.props.children[i].props.label, TAB_FONT) + ADD_WIDTH;
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

        return <div className={styles['tabs-root']}>
            <div className={styles['visible-tabs']}>
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

const HiddenTabs: React.FunctionComponent<IHiddenTabsProps> = (props) => (
    <div className={styles['hidden-tabs-btn']}>
        <Dropdown
            overlay={<Menu>
                {props.children}
            </Menu>}
        >
            <div>...{props.children.length}</div>
        </Dropdown>
    </div>
);
