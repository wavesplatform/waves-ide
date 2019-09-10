import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.less';
import cn from 'classnames';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import Scrollbar from '@components/Scrollbar';
import Menu, { MenuItem, SubMenu } from 'rc-menu';
import Icn from '@components/ReplsPanel/Tests/Icn';
import { ISuite } from '@utils/jsFileInfo';

interface ITestTreeProps extends IResizableProps {
    tree: ISuite | null
}

@observer
class TestExplorer extends React.Component<ITestTreeProps> {

    getIcon = (test: any) => {
        let icon =  <Icn type="default"/>;
        if (test.status === 'pending') icon =  <Icn type="progress"/>;
        else if (test.status === 'passed') icon = <Icn type="success"/>;
        else if (test.status === 'failed') icon =  <Icn type="error"/>;
        return icon;
    };

    defaultOpenKeys: string[] = [];

    private renderMenu = (items: any[], depth: number) => {
        return items.map(((item, i) => {
            if (item.suites || item.tests) {
                const key = item.title + i + depth;
                this.defaultOpenKeys.push(key);
                return <SubMenu
                    expandIcon={<i className={'rc-menu-submenu-arrow'} style={{left: (16 * depth)}}/>}
                    key={key}
                    title={<div className={cn(styles.flex, styles.tests_explorerTitle)}>
                        {this.getIcon(item)}
                        {`Suite: ${item.title}`}
                    </div>}
                >
                    {item.tests && this.renderMenu(item.tests, depth + 1)}
                    {item.suites && this.renderMenu(item.suites, depth + 1)}
                </SubMenu>;
            } else {
                return <MenuItem className={cn(styles.tests_caption, styles.flex)} key={Math.random()}>
                    {this.getIcon(item)}
                    Test: {item.title}
                </MenuItem>;
            }
        }));
    };


    render() {
        const {tree} = this.props;
        this.defaultOpenKeys.length = 0;
        let menu = <div/>;
        if (tree != null) {
            const test = this.renderMenu(tree.tests, 1);
            const suites = this.renderMenu(tree.suites, 1);
            menu = <Menu
                selectable={false}
                mode="inline"
                inlineIndent={16}
                defaultOpenKeys={this.defaultOpenKeys}
            >
                {test}{suites}
            </Menu>;
        }

        return <div className={styles.tests_explorerWrapper}>
            <Scrollbar className={styles.tests_explorer} children={menu}/>
        </div>;
    }
}


export default withResizableWrapper(TestExplorer);
