import React from 'react';
import classnames from 'classnames';
import Dropdown from 'rc-dropdown';
import Menu from 'rc-menu';
import styles from './styles.less';
import { range } from '@utils/range';
import { getTextWidth } from '@utils/getTextWidth';
import Tab, { ITabProps } from '@src/components/Tabs/Tab';
import Scrollbar from '@components/Scrollbar';
import { autorun, computed, IReactionDisposer, observable, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { TabsStore } from '@stores';
import { TTabInfo } from '@stores/TabsStore';

const MIN_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-min-width')
) || 150;
const MAX_TAB_WIDTH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--tab-component-max-width')
) || 240;
const HIDDEN_TAB_BTN_WIDTH = 85;

const TAB_FONT = '14px Roboto';

export interface ITabsProps {
    tabsStore?: TabsStore
    // tabs: (ITabProps & { index: number })[]
    // activeTabIndex: number
    className?: string
}

export interface ITabsState {
    inScrollMode: boolean,
    // tabsCoordinates: {left: number, width: number}[]
}

@inject('tabsStore')
@observer
export default class Tabs extends React.Component<ITabsProps, ITabsState> {
    private containerRef: HTMLDivElement | null = null;
    state = {
        inScrollMode: false
    };


    @computed
    get tabsInfoWithCoordinates() {
        const tabsInfo = this.props.tabsStore!.tabsInfo;
        const coordinates = this.calculateTabsCoordinates(tabsInfo);
        return tabsInfo.map((info, i) => ({info, index: i, ...coordinates[i]}));
    }

    private calculateTabsCoordinates(tabInfo: TTabInfo[]) {
        const ADD_WIDTH = 2 * 24 /*c padding*/ + 2 * 8 /*t padding*/ + 16 /*icon*/ + 12 /*button*/ + 1 /*divisor*/;
        return tabInfo.map(info => {
            const tabWidth = getTextWidth(info.label, TAB_FONT) + ADD_WIDTH;
            // console.log(`${tab.info.label} - ${tabWidth}`)
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
        }, [] as  { left: number, width: number }[]);
    }


    private scrollToActiveTab() {
        const activeTabIndex = this.props.tabsStore!.activeTabIndex;
        const activeTabInfo = this.tabsInfoWithCoordinates[activeTabIndex];
        if (!this.containerRef || !activeTabInfo) return;

        const currentLeft = this.containerRef.scrollLeft;
        const currentWidth = this.containerRef.offsetWidth;
        const currentRight = currentLeft + currentWidth;
        const activeTabRight = activeTabInfo.left + activeTabInfo.width;

        if (currentLeft > activeTabInfo.left) {
            this.containerRef.scrollLeft = activeTabInfo.left;
        } else if (currentRight < activeTabRight) {
            this.containerRef.scrollLeft = activeTabRight - currentWidth;
        }
    }

    private checkScrollMode() {
        if (!this.containerRef) return;
        const currentWidth = this.containerRef.offsetWidth;
        const scrollWidth = this.containerRef.scrollWidth;
        const inScrollMode = currentWidth - scrollWidth + HIDDEN_TAB_BTN_WIDTH * +this.state.inScrollMode < 0;

        if (inScrollMode !== this.state.inScrollMode) this.setState({inScrollMode});
    }

    componentDidMount() {
        this.checkScrollMode();
        this.scrollToActiveTab();
    }

    componentDidUpdate() {
        this.checkScrollMode();
        this.scrollToActiveTab();
    }


    render() {
        const {tabsStore, className} = this.props;
        const activeTabIndex = tabsStore!.activeTabIndex;
        const {inScrollMode} = this.state;
        const tabsInfos = this.tabsInfoWithCoordinates;

        const tabs = tabsInfos.map((props, i) => <Tab key={i}
                                                      active={props.index === activeTabIndex}
                                                      onClick={() => tabsStore!.selectTab(props.index)}
                                                      onClose={() => tabsStore!.closeTab(props.index)}
                                                      {...props}/>);

        return <>
            <Scrollbar containerRef={ref => this.containerRef = ref} suppressScrollY
                       className={classnames(styles['tabs'], className)}>
                {tabs}
            </Scrollbar>
            {inScrollMode && <HiddenTabs/>}
        </>;

    }
}

interface IHiddenTabsProps {
    children: React.ReactElement<ITabProps>[]
}

const HiddenTabs: React.FunctionComponent<IHiddenTabsProps> = (props) => (
    <Dropdown
        trigger={['click']}
        overlay={<Menu className={styles['dropdown-block']}>
            {/*{props.children}*/}
        </Menu>}
    >
        <div className={styles['hidden-tabs-btn']}>
            <div className={styles['hidden-tabs-btn-content-wrapper']}>
                <div className={'list-12-basic-600'}/>
                {/*<div className={'body-3basic700left'}>{props.children.length}</div>*/}
            </div>
        </div>
    </Dropdown>

);
