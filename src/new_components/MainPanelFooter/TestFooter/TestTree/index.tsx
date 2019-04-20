import React from 'react';
import Tree from 'rc-tree';
import { testRunner } from '@services';
import Scrollbar from '@src/new_components/Scrollbar';

import styles from './styles.less';
import { UIStore } from '@stores';

interface IProps {
    compilationResult: any
    file: string
    uiStore?: UIStore
}

interface IState {
}

export default class TestTree extends React.Component<IProps, IState> {

    runTest = (title: string) => () => {
        this.props.uiStore!.replsPanel.activeTab = 'testRepl';
        testRunner.runTest(this.props.file, title);
    };

    private renderTree = (items: any[], spaceCount: number) => items.map(((item, i) => (item.suites || item.tests)
            ? <Tree.TreeNode
                key={item.fullTitle() + i.toString()}
                title={<span onClick={this.runTest(item.fullTitle())}>run {`suite: ${item.title}`}</span>}
            >
                <span onClick={this.runTest(item.fullTitle())}>
                    run {`suite: ${item.title}`}
                </span>
                {item.tests && this.renderTree(item.tests, spaceCount + 1)}
                {item.suites && this.renderTree(item.suites, spaceCount + 1)}
            </Tree.TreeNode>
            : <Tree.TreeNode
                key={item.fullTitle()}
                title={<span onClick={this.runTest(item.fullTitle())}>run {`test: ${item.title}`}</span>}
            />
    ));

    render() {
        const {compilationResult} = this.props;
        return <Scrollbar className={styles.root}>
            <Tree defaultExpandAll>
                {this.renderTree(compilationResult.tests, 0)}
                {this.renderTree(compilationResult.suites, 0)}
            </Tree>
        </Scrollbar>;
    }
}

