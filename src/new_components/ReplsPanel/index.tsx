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

enum REPl_TYPE {
    test,
    compilation,
    blockchain
}

interface IInjectedProps {
    filesStore?: FilesStore
    replsStore?: ReplsStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
}

interface IReplTabProps {
    name: string
    onClick: () => void
    counter?: number
}

const ReplTab = (props: IReplTabProps) => {
    return (
        <div className={styles.replTab} onClick={props.onClick}>
            <div className={styles.replTab_name}>{props.name}</div>
            <div className={styles.replTab_counter}>{props.counter ? props.counter : 0}</div>
        </div>
    );
};

@inject('filesStore', 'settingsStore', 'replsStore', 'uiStore')
@observer
export default class ReplsPanel extends React.Component<IProps> {
    // TO DO uncomment when mobx-react@6.0.0 be would be released
    // private resizableWrapperRef = React.createRef<IWrappedComponent<ReplsPanelResizableWrapper>>();
    private resizableWrapperRef = React.createRef<any>();
    private blockchainReplRef = React.createRef<Repl>();
    private compilationReplRef = React.createRef<Repl>();
    private testReplRef = React.createRef<Repl>();

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;
    
    private consoleEnvDisposer?: IReactionDisposer;
    private compilationReplDisposer?: IReactionDisposer;

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

    private writeToRepl = (type: REPl_TYPE, method: string, message: any) => {
        const TypeReplInstanceMap: {[type: number]: null | Repl} = {
            [REPl_TYPE.test]: this.testReplRef.current,
            [REPl_TYPE.compilation]: this.compilationReplRef.current,
        };

        const replInstance = TypeReplInstanceMap[type];

        replInstance && replInstance.methods[method](message);
    }

    subscribeToComponentsMediator = () => {
        let ComponentsMediator = this.context;

        ComponentsMediator && ComponentsMediator!.subscribe(
            'testRepl => write',
            this.writeToRepl.bind(this, REPl_TYPE.test)
        );
    }

    private createDisposers = () => {
        const { settingsStore, filesStore } = this.props;

        const blockchainReplInstance = this.blockchainReplRef.current;  

        this.consoleEnvDisposer = autorun(() => {
            testRunner.updateEnv(settingsStore!.consoleEnv);

            blockchainReplInstance && blockchainReplInstance.updateEnv(
                settingsStore!.consoleEnv
            );
        });

        this.compilationReplDisposer = autorun(() => {
            const file = filesStore!.currentFile;

            if (file && file.type === FILE_TYPE.JAVA_SCRIPT) {
                    const isCompiled = file.info.isCompiled;

                    isCompiled
                        ? this.writeToRepl(REPl_TYPE.compilation, 'log', 'js compiled succesfully')
                        : this.writeToRepl(REPl_TYPE.compilation, 'error', 'error'); //file.info.compililation.message)
            }

            if (file && file.type === FILE_TYPE.RIDE) {
                    const isCompiled = !('error' in file.info.compiled);

                    isCompiled
                        ? this.writeToRepl(REPl_TYPE.compilation, 'log', 'ride compiled succesfully')
                        : this.writeToRepl(REPl_TYPE.compilation, 'error', file.info.compiled.error);
            }
        });
    }

    private removeDisposers = () => {
        this.consoleEnvDisposer && this.consoleEnvDisposer();
        this.compilationReplDisposer && this.compilationReplDisposer(); 
    }

    // TO DO перенести в FilesStore
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
    }
    
    componentDidMount() {        
        const testReplInstance = this.testReplRef.current;
        const blockchainReplInstance = this.blockchainReplRef.current;  

        this.subscribeToComponentsMediator();

        this.createDisposers();

        blockchainReplInstance && blockchainReplInstance.updateEnv({ 
            file: this.getFileContent
        });

        testReplInstance && testRunner.bindReplAPItoRunner(
            testReplInstance.API
        );
    }

    componentWillUnmount() {
        this.removeDisposers();
    }

    getCompilationReplCouter = () => {
        const { filesStore } = this.props;

        const file = filesStore!.currentFile;

        let counter: number = 0;

        if (file && file.type === FILE_TYPE.JAVA_SCRIPT) {
            counter = 0;
        }

        if (file && file.type === FILE_TYPE.RIDE) {
            const isCompiled = !('error' in file.info.compiled);
            
            counter = isCompiled ? 0 : 1;
        }

        return counter;
    }

    render() {
        const { uiStore } = this.props;

        const { isOpened } = uiStore!.replsPanel;

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
