import React from 'react';
import Tree, { TreeNode } from 'rc-tree';
import { testRunner } from '@services';
import Scrollbar from '@src/components/Scrollbar';

import styles from './styles.less';
import { IJSFile, UIStore } from '@stores';

interface IProps {
    compilationResult: any
    file: IJSFile
    uiStore?: UIStore
}

interface IState {
}

export default class TestTree extends React.Component<IProps, IState> {

    runTest = (title: string) => () => {
        this.props.uiStore!.replsPanel.activeTab = 'Tests';
        testRunner.runTest(this.props.file, title);
    };

    private renderTree = (items: any[]) =>
        items.map(((item, i) => (item.suites || item.tests)

                ? <TreeNode
                    key={item.fullTitle + i.toString()}
                    title={<span onClick={this.runTest(item.fullTitle)}>run {`suite: ${item.title}`}</span>}
                >
                    {item.tests && this.renderTree(item.tests)}
                    {item.suites && this.renderTree(item.suites)}
                </TreeNode>

                : <TreeNode
                    key={item.fullTitle}
                    title={<span onClick={this.runTest(item.fullTitle)}>run {`test: ${item.title}`}</span>}
                />

        ));

    render() {
        const {compilationResult} = this.props;
        return <Scrollbar className={styles.root}>
            <Tree defaultExpandAll>
                {this.renderTree(compilationResult.tests)}
                {this.renderTree(compilationResult.suites)}
            </Tree>
        </Scrollbar>;
    }
}

