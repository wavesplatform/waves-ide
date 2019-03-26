import React from 'react';
import { autorun, IReactionDisposer } from 'mobx';
import { inject, observer, IWrappedComponent } from 'mobx-react';

import { Repl } from '@waves/waves-repl';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/InkTabBar';

import ReplsPanelResizableWrapper from '@src/new_components/ReplsPanelResizableWrapper';

import {
    FilesStore,
    ReplsStore,
    SettingsStore,
    UIStore,
    IFile,
    FILE_TYPE
} from '@stores';

import * as testRunner from '@utils/testRunner';
import TestReplMediatorContext from '@utils/ComponentsMediatorContext';

import 'rc-tabs/assets/index.css';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
    replsStore?: ReplsStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
}

@inject('filesStore', 'settingsStore', 'replsStore', 'uiStore')
@observer
export default class TabsContainer extends React.Component<IProps> {
    // TO DO uncomment when mobx-react@6.0.0 be would be released
    // private resizableWrapperRef = React.createRef<IWrappedComponent<ReplsPanelResizableWrapper>>();
    private resizableWrapperRef = React.createRef<any>();
    private blockchainReplRef = React.createRef<Repl>();
    private compilationReplRef = React.createRef<Repl>();
    private testReplRef = React.createRef<Repl>();

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;
    
    private consoleSyncDisposer?: IReactionDisposer;

    private handleChangeTab = (tab: string) => {
    }

    private handleReplExpand = () => {
        const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

        resizableWrapperInstance && resizableWrapperInstance.expandRepl();
    }

    private handleReplTabClick = () => {
        const { uiStore } = this.props;

        const { isOpened } = uiStore!.replsPanel;

        if (!isOpened) {
            const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

            resizableWrapperInstance && resizableWrapperInstance.expandRepl();
        }
    }

    private writeToTestRepl = (method: string, message: any) => {
        const testReplInstance = this.testReplRef.current;

        testReplInstance && testReplInstance.methods[method](message);
    }

    private writeToCompilationRepl = (method: string, message: any) => {
        const compilationReplInstance = this.compilationReplRef.current;
        
        compilationReplInstance && compilationReplInstance.methods[method](message);
    }

    subscribeToComponentsMediator = () => {
        let ComponentsMediator = this.context;

        if (ComponentsMediator) {
            ComponentsMediator && ComponentsMediator!.subscribe(
                'testRepl => write',
                this.writeToTestRepl
            );

            ComponentsMediator && ComponentsMediator!.subscribe(
                'compilationRepl => write',
                this.writeToCompilationRepl
            );
        }
    };

    private getFileContent = (fileName?: string) => { //Function, responsible for getting file content
        const { filesStore } = this.props;

        let file: IFile | undefined;

        if (!fileName) {
            file = filesStore!.currentFile;

            if (file == null) throw new Error('No file opened in editor');
        } else {
            file = filesStore!.files.find(file => file.name === fileName);

            if (file == null) throw new Error(`No file with name ${fileName}`);
        }

        return file.content;
    };

    componentDidMount() {
        const { settingsStore } = this.props;
        
        const testReplInstance = this.testReplRef.current;
        const blockchainReplInstance = this.blockchainReplRef.current;  

        this.subscribeToComponentsMediator();

        blockchainReplInstance && blockchainReplInstance.updateEnv({ 
            file: this.getFileContent
        });

        testReplInstance && testRunner.bindReplAPItoRunner(
            testReplInstance.API
        );

        this.consoleSyncDisposer = autorun(() => {
            testRunner.updateEnv(settingsStore!.consoleEnv);

            blockchainReplInstance && blockchainReplInstance.updateEnv(
                settingsStore!.consoleEnv
            );
        });
    }

    componentWillUnmount() {
        this.consoleSyncDisposer && this.consoleSyncDisposer();
    }

    getReplTab = (name: string, counter: number) => {
        return (
            <div className={styles.replTab} onClick={this.handleReplTabClick}>
                <div className={styles.replTab_name}>{name}</div>
                <div className={styles.replTab_counter}>{counter}</div>
            </div>
        );
    }

    render() {
        const {
            filesStore,
            uiStore
        } = this.props;

        const { isOpened } = uiStore!.replsPanel;

        const file = filesStore!.currentFile;

        if (!file) {

        } else if (file.type === FILE_TYPE.JAVA_SCRIPT) {
            const isCompiled = file.info.isCompiled;

            isCompiled
                ? this.writeToCompilationRepl('log', 'js compiled succesfully')
                // : this.writeToCompilationRepl('error', file.info.compililation.message);
                : this.writeToCompilationRepl('error', 'error');
        } else if (file.type === FILE_TYPE.RIDE) {
            const isCompiled = !('error' in file.info.compiled);

            isCompiled
                ? this.writeToCompilationRepl('log', 'ride compiled succesfully')
                : this.writeToCompilationRepl('error', file.info.compiled.error);
        }


        return (
            <ReplsPanelResizableWrapper ref={this.resizableWrapperRef}>
                <div className={styles.root}>
                    <div
                        className={styles.expander}
                        onClick={this.handleReplExpand}
                    >
                        {isOpened
                            ? <div className="arrowdown-12-basic-700"></div>
                            : <div className="arrowup-12-basic-700"></div>
                        }
                    </div>
                    <Tabs
                        defaultActiveKey="blockchainRepl"
                        onChange={this.handleChangeTab}
                        renderTabBar={() => <InkTabBar/>}
                        renderTabContent={() => <TabContent/>}
                    >
                        <TabPane
                            forceRender={true}
                            key="blockchainRepl"
                            tab={this.getReplTab('Console', 0)}
                        >
                            <div className={styles.repl}>
                                <Repl
                                    ref={this.blockchainReplRef}
                                    theme="light"
                                />
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="compilationRepl"
                            tab={this.getReplTab('Problems', 0)}
                        >
                            <div className={styles.repl}>
                                <Repl
                                    ref={this.compilationReplRef}
                                    readOnly={true}
                                    theme="light"
                                />
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="testRepl"
                            tab={this.getReplTab('Tests', 0)}
                        >
                            <div className={styles.repl}>
                                <Repl
                                    ref={this.testReplRef}
                                    readOnly={true}
                                    theme="light"
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </ReplsPanelResizableWrapper>
        );
    }
}
