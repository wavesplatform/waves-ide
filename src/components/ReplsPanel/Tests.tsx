import React from 'react';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { Repl } from '@waves/waves-repl';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import { testRunner } from '@services';
import { FILE_TYPE, FilesStore, IJSFile, SettingsStore, UIStore } from '@stores';
import Scrollbar from '@components/Scrollbar';
import Menu, { MenuItem, SubMenu } from 'rc-menu';
import cn from 'classnames';

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


    private getFileFromTestRunner = (): IJSFile | null => {
        const file = testRunner.info.fileId ? this.props.filesStore!.fileById(testRunner.info.fileId) : null;
        if (file != null && file.type === FILE_TYPE.JAVA_SCRIPT) return file;
        return null;
    };


    private handleRerunFullTest = () => {
        const {uiStore, filesStore} = this.props;
        const file = this.getFileFromTestRunner();
        if (file == null) return;

        uiStore!.replsPanel.activeTab = 'testRepl';
        filesStore!.currentDebouncedChangeFnForFile && filesStore!.currentDebouncedChangeFnForFile.flush();

        testRunner.runTest(file);
    };

    private handleStopTest = () => testRunner.isRunning && testRunner.stopTest();

    render(): React.ReactNode {
        const file = this.getFileFromTestRunner();
        return <div className={styles.tests}>
            <div className={styles.tests_toolbar}>
                <div
                    className={styles[`tests_startIcn${(testRunner.isRunning || file == null) ? '_disabled' : ''}`]}
                    onClick={this.handleRerunFullTest}
                />
                <div
                    className={styles[`tests_stopIcn${!testRunner.isRunning ? '_disabled' : ''}`]}
                    onClick={this.handleStopTest}
                />
                <div className={styles.tests_passedTitle}>{testRunner.info.fileName || ''}</div>
            </div>
            <div className={styles.tests_body}>
                <TestExplorerWrapper
                    minSize={150}
                    maxSize={600}
                    storeKey="testExplorer"
                    resizeSide={'right'}
                    disableExpand
                >
                    {file != null &&
                    <TestExplorer
                        uiStore={this.props.uiStore}
                        file={file}
                        compilationResult={(testRunner.info.tree)}
                    />}
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
    file: IJSFile
    uiStore?: UIStore
}

@observer
class TestExplorer extends React.Component<ITestTreeProps> {

    runTest = (title: string) => () => {
        this.props.uiStore!.replsPanel.activeTab = 'testRepl';
        testRunner.runTest(this.props.file, title);
    };

    getIcon = (test: any) => {
        let icon = <div className={styles.tests_defaultIcn}/>;
        if (test.status === 'pending') icon = <div className={styles.tests_warningProgressIcn}/>;
        else if (test.status === 'passed') icon = <div className={styles.tests_successIcn}/>;
        else if (test.status === 'failed') icon = <div className={styles.tests_errorIcn}/>;
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
        const {compilationResult} = this.props;
        this.defaultOpenKeys.length = 0;
        const test = this.renderMenu(compilationResult.tests, 1);
        const suites = this.renderMenu(compilationResult.suites, 1);
        return <Scrollbar className={styles.tests_explorer}>
            <Menu
                selectable={false}
                mode="inline"
                inlineIndent={16}
                defaultOpenKeys={this.defaultOpenKeys}
            >
                {test}
                {suites}
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

@observer
class StatusBar extends React.Component {
    render(): React.ReactNode {

        const {isRunning, info: {passes, testsCount}} = testRunner;

        let icon = <div className={styles.tests_defaultIcn}/>;
        if (isRunning) icon = <div className={styles.tests_warningProgressIcn}/>;
        else if (testsCount > 0 && passes === testsCount) icon = <div className={styles.tests_successIcn}/>;
        else if (testsCount > 0 && passes !== testsCount) icon = <div className={styles.tests_errorIcn}/>;

        return <div className={styles.tests_statusBar}>
            {icon}
            <div className={styles.tests_passedTitle}>Tests passed:</div>
            &nbsp;
            <div className={styles.tests_caption}>{passes} of {testsCount} tests</div>
        </div>;
    }
}
