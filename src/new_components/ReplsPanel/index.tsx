import React from 'react';
import { autorun, IReactionDisposer, Lambda, observe } from 'mobx';
import { inject, observer } from 'mobx-react';
import cn from 'classnames';

import { FilesStore, IFile, ReplsStore, SettingsStore, TabsStore, UIStore } from '@stores';

import { IEventDisposer, mediator, testRunner } from '@services';

import { Repl } from '@waves/waves-repl';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/InkTabBar';
import ReplTab from './ReplTab';

import ReplsPanelResizableWrapper from '@src/new_components/ReplsPanelResizableWrapper';

import styles from './styles.less';

enum REPl_TYPE {
    TEST,
    COMPILATION,
    BLOCKCHAIN
}

interface IInjectedProps {
    filesStore?: FilesStore
    replsStore?: ReplsStore
    tabsStore?: TabsStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
}

//TO DO split on to several repl components
@inject('filesStore', 'settingsStore', 'replsStore', 'uiStore', 'tabsStore')
@observer
class ReplsPanel extends React.Component<IProps> {
    // TO DO uncomment when mobx-react@6.0.0 be would be released
    // private resizableWrapperRef = React.createRef<IWrappedComponent<ReplsPanelResizableWrapper>>();
    private resizableWrapperRef = React.createRef<any>();
    private blockchainReplRef = React.createRef<Repl>();
    private compilationReplRef = React.createRef<Repl>();
    private testReplRef = React.createRef<Repl>();

    private consoleEnvUpdateDisposer?: IReactionDisposer;
    private compilationReplWriteDisposer?: IReactionDisposer;
    private compilationReplClearDisposer?: Lambda;
    private testReplWriteDisposer?: IEventDisposer;
    private testReplClearDisposer?: IEventDisposer;

    private handleReplsPanelExpand = () => {
        const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

        resizableWrapperInstance && resizableWrapperInstance.expand();
    }

    private handleReplTabClick = (key: 'blockchainRepl' | 'compilationRepl' | 'testRepl') => () => {
        this.props.uiStore!.replsPanel.activeTab = key;
        const {isOpened} = this.props.uiStore!.replsPanel;

        if (!isOpened) {
            const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

            resizableWrapperInstance && resizableWrapperInstance.expand();
        }
    }

    private getReplInstance = (type: REPl_TYPE) => {
        const TypeReplInstanceMap: { [type: number]: null | Repl } = {
            [REPl_TYPE.TEST]: this.testReplRef.current,
            [REPl_TYPE.COMPILATION]: this.compilationReplRef.current,
        };

        return TypeReplInstanceMap[type];
    }

    private writeToRepl = (type: REPl_TYPE, method: string, ...args: any[]) => {
        const replInstance = this.getReplInstance(type);


        replInstance && replInstance.methods[method](...args);
    }

    private clearRepl = (type: REPl_TYPE) => {
        const replInstance = this.getReplInstance(type);

        replInstance && replInstance.methods.clear();
    }

    private subscribeToComponentsMediator = () => {
        this.testReplWriteDisposer = mediator.subscribe(
            'testRepl => write',
            this.writeToRepl.bind(this, REPl_TYPE.TEST)
        );

        this.testReplClearDisposer = mediator.subscribe(
            'testRepl => clear',
            this.clearRepl.bind(this, REPl_TYPE.TEST)
        );
    }

    private unsubscribeToComponentsMediator = () => {
        this.testReplWriteDisposer && this.testReplWriteDisposer();
        this.testReplClearDisposer && this.testReplClearDisposer();
    };

    private createReactions = () => {
        const {settingsStore, filesStore, tabsStore} = this.props;

        const blockchainReplInstance = this.blockchainReplRef.current;

        //consoleEnvUpdateReaction
        this.consoleEnvUpdateDisposer = autorun(() => {
            testRunner.updateEnv(settingsStore!.consoleEnv);

            blockchainReplInstance && blockchainReplInstance.updateEnv(
                settingsStore!.consoleEnv
            );
        }, {name: 'consoleEnvUpdateReaction'});

        //changeCurrentFileReaction
        if (tabsStore) {
            this.compilationReplClearDisposer = observe(
                tabsStore,
                'activeTabIndex',
                () => this.clearRepl(REPl_TYPE.COMPILATION)
            );
        }

        //compilationReplWriteReaction
        this.compilationReplWriteDisposer = autorun(() => {
            const file = filesStore!.currentFile;

            if (file && file.info) {
                this.clearRepl(REPl_TYPE.COMPILATION);

                if ('error' in file.info.compilation) {
                    this.writeToRepl(REPl_TYPE.COMPILATION, 'error', file.info.compilation.error);
                } else {
                    this.writeToRepl(REPl_TYPE.COMPILATION, 'log', `${file.name} file compiled succesfully`);
                }
            }
        }, {name: 'compilationReplWriteReaction'});
    }

    private removeReactions = () => {
        this.consoleEnvUpdateDisposer && this.consoleEnvUpdateDisposer();
        this.compilationReplWriteDisposer && this.compilationReplWriteDisposer();
        this.compilationReplClearDisposer && this.compilationReplClearDisposer();
    }

    componentDidMount() {
        const getFileContent = this.props.filesStore!.getFileContent;
        const blockchainReplInstance = this.blockchainReplRef.current;

        this.subscribeToComponentsMediator();

        this.createReactions();

        blockchainReplInstance && blockchainReplInstance.updateEnv({
            file: getFileContent
        });

    }

    componentWillUnmount() {
        this.unsubscribeToComponentsMediator();

        this.removeReactions();
    }

    getCompilationReplErrorsLabel = () => {
        const {currentFile} = this.props.filesStore!;

        if (currentFile && currentFile.info) {
            const isCompiled = !('error' in currentFile.info.compilation);

            return isCompiled ? '0' : '1';
        }

        return '0';
    }

    getTestReplStatsLabel = () => {
        const {passes, failures} = testRunner.stats;

        return `${passes}/${passes + failures}`;
    }

    getExpanderCn = () => {
        const {isOpened} = this.props.uiStore!.replsPanel;

        return cn(
            styles.expander,
            {[styles.expander__isOpened]: isOpened}
        );
    }

    render() {
        return (
            <ReplsPanelResizableWrapper ref={this.resizableWrapperRef}>
                <div className={styles.root}>
                    <div className={this.getExpanderCn()} onClick={this.handleReplsPanelExpand}/>

                    <Tabs
                        // defaultActiveKey="blockchainRepl"
                        activeKey={this.props.uiStore!.replsPanel.activeTab}
                        renderTabBar={() => <InkTabBar/>}
                        renderTabContent={() => <TabContent/>}
                    >
                        <TabPane
                            forceRender={true}
                            key="blockchainRepl"
                            tab={
                                <ReplTab
                                    name={'Console'}
                                    onClick={this.handleReplTabClick('blockchainRepl')}
                                />
                            }
                        >
                            <div className={cn(styles.repl, styles.repl__blockchain)}>
                                <Repl ref={this.blockchainReplRef}/>
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="compilationRepl"
                            tab={
                                <ReplTab
                                    name={'Problems'}
                                    label={this.getCompilationReplErrorsLabel()}
                                    onClick={this.handleReplTabClick('compilationRepl')}
                                />
                            }
                        >
                            <div className={cn(styles.repl, styles.repl__compilation)}>
                                <Repl ref={this.compilationReplRef} readOnly={true} />
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="testRepl"
                            tab={
                                <ReplTab
                                    name={'Tests'}
                                    label={this.getTestReplStatsLabel()}
                                    onClick={this.handleReplTabClick('testRepl')}
                                />
                            }
                        >
                            <div className={cn(styles.repl, styles.repl__test)}>
                                <Repl ref={this.testReplRef} readOnly={true} />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </ReplsPanelResizableWrapper>
        );
    }
}

export default ReplsPanel;
