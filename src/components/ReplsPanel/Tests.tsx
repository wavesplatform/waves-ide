import React from 'react';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { Repl } from '@waves/waves-repl';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import { testRunner } from '@services';
import { FILE_TYPE, FilesStore, IJSFile, SettingsStore, UIStore } from '@stores';
import Scrollbar from '@components/Scrollbar';
import Menu, { MenuItem, SubMenu } from 'rc-menu';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}


interface IProps extends IInjectedProps {
    testRef: React.RefObject<Repl>
}

interface IState {

}

@inject('filesStore', 'settingsStore', 'uiStore')
@observer
export default class Tests extends React.Component<IProps, IState> {

    getActiveFile = (): IJSFile | undefined => {
        const {filesStore} = this.props;
        const file = filesStore!.currentFile;
        if (!file || file.type !== FILE_TYPE.JAVA_SCRIPT || testRunner.isRunning) return;
        return file;
    };

    private handleRunFullTest = () => {
        const {filesStore, uiStore} = this.props;
        const file = this.getActiveFile();
        if (!file) return;

        uiStore!.replsPanel.activeTab = 'testRepl';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();

        testRunner.runTest(file.content);
    };

    private handleStopTest = () => testRunner.isRunning && testRunner.stopTest();

    private renderTestExplorer = () => {
        const file = this.getActiveFile();
        if (!file) return;

        const fileInfo = file.info;

        if (fileInfo && !('error' in fileInfo.compilation)) {
            return <TestExplorer
                uiStore={this.props.uiStore}
                file={file.content}
                compilationResult={fileInfo.compilation.result}/>;
        }
        return;
    };

    render(): React.ReactNode {
        return <div className={styles.tests}>
            <div className={styles.tests_toolbar}>
                <div
                    className={styles[`tests_startIcn${testRunner.isRunning ? '_disabled' : ''}`]}
                    onClick={this.handleRunFullTest}
                />
                <div
                    className={styles[`tests_stopIcn${!testRunner.isRunning ? '_disabled' : ''}`]}
                    onClick={this.handleStopTest}
                />
            </div>
            <div className={styles.tests_body}>
                <TestExplorerWrapper
                    minSize={150}
                    maxSize={400}
                    storeKey="testExplorer"
                    resizeSide={'right'}
                    disableExpand
                >
                    {this.renderTestExplorer()}
                </TestExplorerWrapper>
                <div className={styles.tests_replPanel}>
                    <StatusBar/>
                    <Repl className={styles.tests_repl} ref={this.props.testRef} readOnly={true}/>
                </div>
            </div>

        </div>;
    }

}

interface ITestTreeProps {
    compilationResult: any
    file: string
    uiStore?: UIStore
}

class TestExplorer extends React.Component<ITestTreeProps> {

    runTest = (title: string) => () => {
        this.props.uiStore!.replsPanel.activeTab = 'testRepl';
        testRunner.runTest(this.props.file, title);
    };

    private renderMenu = (items: any[]) =>
        items.map(((item, i) => (item.suites || item.tests)

                ? <SubMenu
                    key={item.fullTitle + i.toString()}
                    title={<div>{`Suite: ${item.title}`}</div>}
                >
                    {item.tests && this.renderMenu(item.tests)}
                    {item.suites && this.renderMenu(item.suites)}
                </SubMenu>

                : <MenuItem>Test: {item.title}</MenuItem>

        ));

    render() {
        const {compilationResult} = this.props;
        return <Scrollbar className={styles.tests_explorer}>
            <Menu mode="inline" inlineIndent={16}>
                {this.renderMenu(compilationResult.tests)}
                {this.renderMenu(compilationResult.suites)}
            </Menu>
        </Scrollbar>;
    }
}


interface ITestExplorerProps extends IResizableProps {
}

class _TestExplorerWrapper extends React.Component<ITestExplorerProps> {
    render(): React.ReactNode {
        return <div className={styles.tests_explorerWrapper}>{this.props.children}</div>;
    }
}

const TestExplorerWrapper = withResizableWrapper(_TestExplorerWrapper);


const StatusBar = ({completed, count}: { completed?: number, count?: number }) =>
    <div className={styles.tests_statusBar}>
        <div className={styles.tests_successIcn}/>
        <div className={styles.tests_passedTitle}>Tests passed:</div>
        &nbsp;
        <div className={styles.tests_caption}>{completed || 0} of {count || 0} tests</div>
    </div>;
