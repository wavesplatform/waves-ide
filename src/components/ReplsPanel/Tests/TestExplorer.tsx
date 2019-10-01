import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.less';
import cn from 'classnames';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import Menu, { MenuItem } from 'rc-menu';
import Icn from '@components/ReplsPanel/Tests/Icn';
import { testRunner } from '@src/services';
import Scrollbar from '@components/Scrollbar';
import { runInAction } from 'mobx';
import { isSuite, ISuiteNode, ITestNode } from '@services/TestRunner';
import { ISuite } from '@utils/jsFileInfo';

interface ITestTreeProps extends IResizableProps {
    tree: ISuite | null
}

@observer
class TestExplorer extends React.Component<ITestTreeProps> {

    getIcon = (test: any) => {
        let icon = <Icn type="default"/>;
        if (test.status === 'pending') icon = <Icn type="progress"/>;
        else if (test.status === 'passed') icon = <Icn type="success"/>;
        else if (test.status === 'failed') icon = <Icn type="error"/>;
        return icon;
    };


    private renderMenu = (items: ISuiteNode[] | ITestNode[] | undefined, depth: number): any[] =>
        (items || []).map(((item: ISuiteNode | ITestNode) => {
            const
                style = {paddingLeft: (16 * depth)},
                key = JSON.stringify(item.path),
                onClick = () => item.path && runInAction(() => testRunner.selectedPath = item.path),
                className = cn(styles[isSuite(item) ? 'tests_explorerTitle' : 'tests_caption'], styles.flex);

            return isSuite(item)
                ? [
                    <MenuItem isSelected={depth === 1} style={style} className={className} key={key} onClick={onClick}>
                        {this.getIcon(item)}{`Suite: ${depth === 1 ? 'ROOT' : item.title}`}
                    </MenuItem>,
                    ...this.renderMenu(item.tests, depth + 1),
                    ...this.renderMenu(item.suites, depth + 1)
                ]
                : [
                    <MenuItem style={style} className={className} key={key} onClick={onClick}>
                        {this.getIcon(item)}Test: {item.title}
                    </MenuItem>
                ];
        }));


    render() {
        const {tree} = this.props;
        return (tree != null)
            ? <div className={styles.tests_explorerWrapper}>
                <Scrollbar
                    suppressScrollX={true}
                    className={styles.tests_explorer}
                    children={
                        <Menu selectedKeys={[JSON.stringify(testRunner.selectedPath)]} >
                            {...this.renderMenu([tree as ISuiteNode], 1)}
                        </Menu>
                    }
                />
            </div>
            : null;
    }
}


export default withResizableWrapper(TestExplorer);
