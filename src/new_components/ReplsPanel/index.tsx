import React from 'react';
import { autorun, observe, reaction, IReactionDisposer } from 'mobx';
import { inject, observer, IWrappedComponent } from 'mobx-react';
import classnames from 'classnames';

import {
    FilesStore,
    ReplsStore,
    TabsStore,
    SettingsStore,
    UIStore,
    IFile
} from '@stores';

import * as testRunner from '@utils/../../services/testRunner';
import ComponentsMediatorContext from '@utils/ComponentsMediatorContext';
import { IEventDisposer } from '@utils/../../services/Mediator';

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

interface IProps extends IInjectedProps {}

@inject('filesStore', 'settingsStore', 'replsStore', 'uiStore', 'tabsStore')
@observer
class ReplsPanel extends React.Component<IProps> {
    // TO DO uncomment when mobx-react@6.0.0 be would be released
    // private resizableWrapperRef = React.createRef<IWrappedComponent<ReplsPanelResizableWrapper>>();
    private resizableWrapperRef = React.createRef<any>();
    private blockchainReplRef = React.createRef<Repl>();
    private compilationReplRef = React.createRef<Repl>();
    private testReplRef = React.createRef<Repl>();

    static contextType = ComponentsMediatorContext;
    context!: React.ContextType<typeof ComponentsMediatorContext>;
    
    private consoleEnvUpdateDisposer?: IReactionDisposer;
    private compilationReplWriteDisposer?: IReactionDisposer;
    private compilationReplClearDisposer?: IReactionDisposer;
    private testReplWriteDisposer?: IEventDisposer;
    private testReplClearDisposer?: IEventDisposer;

    private handleReplsPanelExpand = () => {
        const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

        resizableWrapperInstance && resizableWrapperInstance.expand();
    }

    private handleReplTabClick = () => {
        const { uiStore } = this.props;

        const { isOpened } = uiStore!.replsPanel;

        if (!isOpened) {
            const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

            resizableWrapperInstance && resizableWrapperInstance.expand();
        }
    }

    private getReplInstance = (type: REPl_TYPE) => {
        const TypeReplInstanceMap: {[type: number]: null | Repl} = {
            [REPl_TYPE.TEST]: this.testReplRef.current,
            [REPl_TYPE.COMPILATION]: this.compilationReplRef.current,
        };

        return TypeReplInstanceMap[type];
    }

    private writeToRepl = (type: REPl_TYPE, method: string, message: any) => {
        const replInstance = this.getReplInstance(type);

        replInstance && replInstance.methods[method](message);
    }

    private clearRepl = (type: REPl_TYPE) => {
        const replInstance = this.getReplInstance(type);

        replInstance && replInstance.methods.clear();
    }

    private subscribeToComponentsMediator = () => {
        const ComponentsMediator = this.context!;

        this.testReplWriteDisposer = ComponentsMediator.subscribe(
            'testRepl => write',
            this.writeToRepl.bind(this, REPl_TYPE.TEST)
        );

        this.testReplClearDisposer = ComponentsMediator.subscribe(
            'testRepl => clear',
            this.clearRepl.bind(this, REPl_TYPE.TEST)
        );
    }

    private unsubscribeToComponentsMediator = () => {
        this.testReplWriteDisposer && this.testReplWriteDisposer();
        this.testReplClearDisposer && this.testReplClearDisposer();
    };

    private createReactions = () => {
        const { settingsStore, filesStore, tabsStore } = this.props;

        const blockchainReplInstance = this.blockchainReplRef.current;  

        // TO DO fix bag with ride files
        // this.compilationReplClearDisposer = observe(
        //     tabsStore,
        //     "activeTabIndex",
        //     (change: any) => {
        //         console.log(change);
                
                
        //         this.clearRepl(REPl_TYPE.COMPILATION);
        //     }
        // );

        this.consoleEnvUpdateDisposer = autorun(() => {
            testRunner.updateEnv(settingsStore!.consoleEnv);

            blockchainReplInstance && blockchainReplInstance.updateEnv(
                settingsStore!.consoleEnv
            );
        });

        this.compilationReplWriteDisposer = autorun(() => {
            const file = filesStore!.currentFile;

            // this.clearRepl(REPl_TYPE.COMPILATION);

            if (file && file.info) {
                if ('error' in file.info.compilation) {
                    this.writeToRepl(REPl_TYPE.COMPILATION, 'error', file.info.compilation.error);
                } else {
                    this.writeToRepl(REPl_TYPE.COMPILATION, 'log', ` ${file.name} file compiled succesfully`);
                }
            }
        });
    }

    private removeReactions = () => {
        this.consoleEnvUpdateDisposer && this.consoleEnvUpdateDisposer();
        this.compilationReplWriteDisposer && this.compilationReplWriteDisposer(); 
        this.compilationReplClearDisposer && this.compilationReplClearDisposer(); 
    }

    // TO DO перенести в FilesStore //Function, responsible for getting file content
    private getFileContent = (fileName?: string) => { 
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
    }
    
    componentDidMount() {        
        const testReplInstance = this.testReplRef.current;
        const blockchainReplInstance = this.blockchainReplRef.current;  

        this.subscribeToComponentsMediator();

        this.createReactions();

        blockchainReplInstance && blockchainReplInstance.updateEnv({ 
            file: this.getFileContent
        });

        testReplInstance && testRunner.bindReplAPItoRunner(
            testReplInstance.API
        );
    }

    componentWillUnmount() {
        this.removeReactions();

        this.unsubscribeToComponentsMediator();
    }

    getCompilationReplCouter = () => {
        const { filesStore } = this.props;

        const file = filesStore!.currentFile;

        if (file && file.info) {
            const isCompiled = !('error' in file.info.compilation);
            
            return isCompiled ? 0 : 1;
        }

        return 0;
    }

    render() {
        const { uiStore } = this.props;

        const { isOpened } = uiStore!.replsPanel;

        let expanderClasses = classnames(
            styles.expander,
            {[styles.expander__isOpened]: isOpened}
        );

        return (
            <ReplsPanelResizableWrapper ref={this.resizableWrapperRef}>
                <div className={styles.root}>
                    <div className={expanderClasses} onClick={this.handleReplsPanelExpand}/>

                    <Tabs
                        defaultActiveKey="blockchainRepl"
                        renderTabBar={() => <InkTabBar/>}
                        renderTabContent={() => <TabContent/>}
                    >
                        <TabPane
                            forceRender={true}
                            key="blockchainRepl"
                            tab={
                                <ReplTab
                                    name={'Console'}
                                    onClick={this.handleReplTabClick}
                                />
                            }
                        >
                            <div className={styles.repl}>
                                <Repl ref={this.blockchainReplRef}/>
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="compilationRepl"
                            tab={
                                <ReplTab
                                    name={'Problem'}
                                    counter={this.getCompilationReplCouter()}
                                    onClick={this.handleReplTabClick}
                                />
                            }
                        >
                            <div className={styles.repl}>
                                <Repl ref={this.compilationReplRef} readOnly={true}/>
                            </div>
                        </TabPane>

                        <TabPane
                            forceRender={true}
                            key="testRepl"
                            tab={<ReplTab
                                name={'Tests'}
                                counter={0}
                                onClick={this.handleReplTabClick}/>
                            }
                        >
                            <div className={styles.repl}>
                                <Repl ref={this.testReplRef} readOnly={true}/>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </ReplsPanelResizableWrapper>
        );
    }
}

export default ReplsPanel;
