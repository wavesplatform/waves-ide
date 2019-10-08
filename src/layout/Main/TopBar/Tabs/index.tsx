import { inject, observer } from 'mobx-react';
import React from 'react';
import classnames from 'classnames';
import { TabsStore } from '@stores';
import Tab, { ITabProps } from './Tab';
import { computed, observable } from 'mobx';
import { TTabInfo } from '@stores/TabsStore';
import { getTextWidth } from '@utils/getTextWidth';
import Scrollbar from '@components/Scrollbar';
import Dropdown from 'rc-dropdown';
import Menu from 'rc-menu';
import * as styles from './styles.less';
import ReactResizeDetector from 'react-resize-detector';
import NewFileBtn from '@components/NewFileBtn';

const MIN_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-min-width')
) || 150;
const MAX_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-max-width')
) || 240;

const TAB_FONT = '14px Roboto';

export interface ITabsProps {
    tabsStore?: TabsStore
    className?: string
}

@inject('tabsStore')
@observer
export default class Tabs extends React.Component<ITabsProps> {
    @observable private containerRef: HTMLDivElement | null = null;
    private previousActiveTabIndex = -1;

    @observable scrollLeft = 0;
    @observable currentWidth = 0;

    @computed
    get hiddenTabs() {
        const scrollLeft = this.scrollLeft;
        const currentWidth = this.currentWidth;
        return this.tabsInfoWithCoordinates.filter(info => info.left < scrollLeft - 24
            || info.left + info.width > scrollLeft + currentWidth + 24);

    }

    @computed
    get tabsInfoWithCoordinates() {
        const tabsInfo = this.props.tabsStore!.tabsInfo;
        const activeTabIndex = this.props.tabsStore!.activeTabIndex;
        const coordinates = this.calculateTabsCoordinates(tabsInfo);
        return tabsInfo.map((info, i) => ({info, active: i === activeTabIndex, index: i, ...coordinates[i]}));
    }

    private calculateTabsCoordinates(tabInfo: TTabInfo[]) {
        const ADD_WIDTH = 2 * 24 /*c padding*/ + 2 * 8 /*t padding*/ + 16 /*icon*/ + 12 /*button*/ + 2 /*border*/;
        return tabInfo.map(info => {
            const tabWidth = getTextWidth(info.label, TAB_FONT) + ADD_WIDTH;
            return tabWidth > MIN_TAB_WIDTH ?
                tabWidth > MAX_TAB_WIDTH ?
                    MAX_TAB_WIDTH :
                    tabWidth :
                MIN_TAB_WIDTH;
        }).reduce((acc, width, i) => {
            const previous = acc[i - 1];
            const coordinates = {
                width,
                left: previous ? previous.left + previous.width : 0
            };
            return [...acc, coordinates];
        }, [] as { left: number, width: number }[]);
    }

    private scrollToActiveTab() {
        const activeTabIndex = this.props.tabsStore!.activeTabIndex;
        const activeTabInfo = this.tabsInfoWithCoordinates[activeTabIndex];
        if (!this.containerRef || !activeTabInfo || activeTabIndex === this.previousActiveTabIndex) return;

        const currentLeft = this.containerRef.scrollLeft;
        const currentWidth = this.containerRef.offsetWidth;
        const currentRight = currentLeft + currentWidth;
        const activeTabRight = activeTabInfo.left + activeTabInfo.width;

        if (currentLeft > activeTabInfo.left) {
            this.containerRef.scrollLeft = activeTabInfo.left;
        } else if (currentRight < activeTabRight) {
            this.containerRef.scrollLeft = activeTabRight - currentWidth;
        }

        this.previousActiveTabIndex = activeTabIndex;
    }

    componentDidUpdate() {
        this.scrollToActiveTab();
    }

    handleCloseAll = () => [...this.tabsInfoWithCoordinates]
        .reverse().forEach(({index}) => this.props.tabsStore!.closeTab(index));

    handleCloseOthers = (i: number) => () => [...this.tabsInfoWithCoordinates]
        .reverse().forEach(({index}) => i !== index && this.props.tabsStore!.closeTab(index));

    render() {
        const {tabsStore, className} = this.props;
        const activeTabIndex = tabsStore!.activeTabIndex;

        const tabsInfos = this.tabsInfoWithCoordinates;

        const tabs = tabsInfos.map((props) =>
            <Tab key={props.index}
                 active={props.index === activeTabIndex}
                 onClick={() => tabsStore!.selectTab(props.index)}
                 onClose={() => tabsStore!.closeTab(props.index)}
                 onCloseAll={this.handleCloseAll}
                 onCloseOthers={this.handleCloseOthers(props.index)}
                 {...props}/>
        );

        return <>
            <Scrollbar containerRef={ref => this.containerRef = ref}
                       onScrollX={ref => this.scrollLeft = ref.scrollLeft}
                       suppressScrollY
                       className={classnames(styles['root'], className)}>
                {tabs}
                <ReactResizeDetector handleWidth refreshMode="throttle" onResize={width => this.currentWidth = width}/>

            </Scrollbar>
            <ControlArea>
                {this.hiddenTabs.map((props) => <Tab
                    key={props.index}
                    active={props.active}
                    onClick={() => tabsStore!.selectTab(props.index)}
                    onClose={() => tabsStore!.closeTab(props.index)}
                    hidden {...props}/>)}
            </ControlArea>
        </>;
    }
}

interface IHiddenTabsProps {
    children: React.ReactElement<ITabProps>[]
}

const ControlArea: React.FunctionComponent<IHiddenTabsProps> = props => (
    <div className={styles.controlArea}>
        {props.children.length > 0 && <Dropdown
            trigger={['click']}
            overlay={<Menu className={styles['dropdown-block']}>
                <Scrollbar className={styles['dropdown-scroll']} suppressScrollX>
                    {props.children}
                </Scrollbar>
            </Menu>}
        >
            <div className={styles['hidden-tabs-btn']}>
                <div className={styles.listIcn}/>
                <div className={'body-3basic700left'}>{props.children.length}</div>
            </div>
        </Dropdown>}
        <NewFileBtn position={'topBar'}/>
    </div>
);

// const HiddenTabs: React.FunctionComponent<IHiddenTabsProps> = (props) => (
//
//
// );
