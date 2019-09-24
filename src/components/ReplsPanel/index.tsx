import React from 'react';
import { autorun, computed, IReactionDisposer, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import cn from 'classnames';

import {
    FILE_TYPE,
    FilesStore,
    ReplsStore,
    SettingsStore,
    TabsStore,
    UIStore,
    TBottomTabKey,
    CompilationStore
} from '@stores';

import { testRunner } from '@services';

import { Repl } from '@components/Repl';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/InkTabBar';
import Tab from './Tab';
import styles from './styles.less';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import Compilation from '@components/ReplsPanel/Compilation';
import Tests from '@components/ReplsPanel/Tests';

interface IInjectedProps {
    filesStore?: FilesStore
    replsStore?: ReplsStore
    settingsStore?: SettingsStore,
    uiStore?: UIStore,
    compilationStore?: CompilationStore
}

interface IProps extends IInjectedProps, IResizableProps {
}

@inject('filesStore', 'settingsStore', 'replsStore', 'uiStore', 'compilationStore')
@observer
class ReplsPanel extends React.Component<IProps> {

    private blockchainReplRef = React.createRef<Repl>();

    private consoleEnvUpdateDisposer?: IReactionDisposer;

    private handleTabClick = (key: TBottomTabKey) => () => {
        this.props.uiStore!.replsPanel.activeTab = key;
        if (!this.props.isOpened) this.props.handleExpand();
    };

    private createReactions = () => {
        const {settingsStore} = this.props;

        const blockchainReplInstance = this.blockchainReplRef.current;

        //consoleEnvUpdateReaction
        this.consoleEnvUpdateDisposer = autorun(() => {
            blockchainReplInstance && blockchainReplInstance.updateEnv(
                settingsStore!.consoleEnv
            );
        }, {name: 'consoleEnvUpdateReaction'});

    };

    private removeReactions = () => {
        this.consoleEnvUpdateDisposer && this.consoleEnvUpdateDisposer();
    };

    componentDidMount() {
        const getFileContent = this.props.filesStore!.getFileContent;
        const blockchainReplInstance = this.blockchainReplRef.current;

        this.createReactions();

        blockchainReplInstance && blockchainReplInstance.updateEnv({
            file: getFileContent
        });

    }

    componentWillUnmount() {
        this.removeReactions();
    }


    render() {
        const { compilation, compilationLabel, isCompilationError } = this.props.compilationStore!;
        const testsStatsLabel = `${testRunner.info.passes}/${testRunner.info.testsCount}`;
        const expanderClassName = cn(styles.expander, {[styles.expander__isOpened]: this.props.isOpened});

        const consoleTheme = this.props.uiStore!.editorSettings.isDarkTheme ? 'dark' : 'light';

        return (
            <div className={styles.root}>
                <div className={expanderClassName} onClick={this.props.handleExpand}/>

                <Tabs
                    activeKey={this.props.uiStore!.replsPanel.activeTab}
                    renderTabBar={() => <InkTabBar/>}
                    renderTabContent={() => <TabContent/>}
                >
                    <TabPane
                        forceRender={true}
                        key="Console"
                        tab={<Tab
                                name={'Console'}
                                onClick={this.handleTabClick('Console')}
                            />}
                    >
                        <div className={cn(styles.repl, styles.repl__blockchain)}>
                            <Repl ref={this.blockchainReplRef} theme={consoleTheme}/>
                        </div>
                    </TabPane>

                    <TabPane
                        forceRender={true}
                        key="Compilation"
                        tab={<Tab
                                name={'Compilation'}
                                label={compilationLabel}
                                isError={isCompilationError}
                                onClick={this.handleTabClick('Compilation')}
                            />}
                    >
                        <div className={cn(styles.repl, styles.repl__compilation)}>
                            <Compilation compilation={compilation}/>
                        </div>
                    </TabPane>

                    <TabPane
                        forceRender={true}
                        key="Tests"
                        tab={<Tab name={'Tests'} label={testsStatsLabel} onClick={this.handleTabClick('Tests')}/>}
                    >
                        <div className={cn(styles.repl, styles.repl__test)}>
                            <Tests/>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default withResizableWrapper(ReplsPanel);
