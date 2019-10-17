import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.less';
import cn from 'classnames';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import Menu, { MenuItem } from 'rc-menu';
import Icn from './Icn';
import Scrollbar from '@components/Scrollbar';
import { ITestNode } from '@services/TestRunnerService';

interface ITestTreeProps extends IResizableProps {
    tree: ITestNode | null
    onSelect: (fullTitle: string) => void
}

const Icon: React.FC<{ status?: 'pending' | 'failed' | 'passed' }> = ({status}) => {
    let icon = <Icn type="default"/>;
    if (status === 'pending') {
        icon = <Icn type="progress"/>;
    } else if (status === 'passed') {
        icon = <Icn type="success"/>;
    } else if (status === 'failed') icon = <Icn type="error"/>;
    return icon;
};

@observer
class TestExplorer extends React.Component<ITestTreeProps> {

    private renderMenu = (items: ITestNode[] | undefined, depth: number): any[] =>
        (items || []).map(((item: ITestNode) => {
            const
                style = {paddingLeft: (16 * depth)},
                key = item.fullTitle,
                onClick = () => this.props.onSelect(item.fullTitle),
                className = cn(styles[item.type === 'suite' ? 'tests_explorerTitle' : 'tests_caption'], styles.flex);

            return item.type === 'suite'
                ? [
                    <MenuItem isSelected={depth === 1} style={style} className={className} key={key} onClick={onClick}>
                        <Icon status={item.status}/>{`Suite: ${depth === 1 ? 'ROOT' : item.title}`}
                    </MenuItem>,
                    ...this.renderMenu(item.children, depth + 1),
                ]
                : [
                    <MenuItem style={style} className={className} key={key} onClick={onClick}>
                        <Icon status={item.status}/>Test: {item.title}
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
                        <Menu selectedKeys={[tree.fullTitle]}>
                            {...this.renderMenu([tree], 1)}
                        </Menu>
                    }
                />
            </div>
            : null;
    }
}


export default withResizableWrapper(TestExplorer);
