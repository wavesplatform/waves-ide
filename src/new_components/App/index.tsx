import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Editor from '@components/Editor';
import TopBar from '@components/TopBar';
import EditorTabs from '@components/EditorTabs';
import { Intro } from '@components/intro';
import { UserNotification } from '@components/UserNotification';
import { UserDialog } from '@components/UserDialog';
import { SettingsDialog } from '@components/SettingsDialog';
import { WizardDialog } from '@components/WizardDialog';
import { RightTabs } from '@components/RightTabs';
import FileExplorer from '@components/FileExplorer';
import ReplWrapper from '@components/ReplWrapper';
import { TransactionSigningDialog } from '@components/TransactionSigning';
import { TxGeneratorDialog } from '@components/TxGeneratorDialog';
import withStyles, { StyledComponentProps } from 'react-jss';
import { FilesStore, SettingsStore, ReplsStore, FILE_TYPE, IFile } from '@src/mobx-store';
import { autorun, IReactionDisposer } from 'mobx';

import * as testRunner from '@utils/testRunner';

import styles from './styles';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    replsStore?: ReplsStore
}

interface IAppProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    IInjectedProps {
}

@inject('filesStore', 'settingsStore', 'replsStore')
@observer
class App extends React.Component<IAppProps> {
    private _consoleSyncDisposer?: IReactionDisposer;

    // private handleExternalCommand(e: any) {
    //     const data = e.data;
    //     switch (data.command) {
    //         case 'CREATE_NEW_CONTRACT':
    //             this.props.filesStore!.createFile({
    //                 type: data.fileType || FILE_TYPE.ACCOUNT_SCRIPT,
    //                 content: data.code,
    //                 name: data.label
    //             });

    //             e.source.postMessage({command: data.command, status: 'OK'}, e.origin);
    //             break;
    //     }
    // }

    // getTestReplInstance() {
    //     const { replsStore } = this.props;

    //     const testRepl = replsStore!.repls['testRepl'];

    //     return testRepl.instance;
    // }

    // componentDidMount() {
    //     const { settingsStore, filesStore } = this.props;

    //     // Bind external command
    //     window.addEventListener('message', this.handleExternalCommand.bind(this));

    //     //Create and bind to console function, responsible for getting file content
    //     const fileContent = (fileName?: string) => {
    //         let file: IFile | undefined;
    //         if (!fileName) {
    //             file = filesStore!.currentFile;
    //             if (file == null) throw new Error('No file opened in editor');
    //         }else {
    //             file = filesStore!.files.find(file => file.name === fileName);
    //             if (file == null) throw new Error(`No file with name ${fileName}`);
    //         }

    //         return file.content;
    //     };

    //     const testReplInstance = this.getTestReplInstance();
    //     testReplInstance.updateEnv({file: fileContent});

    //     testRunner.bindReplAPItoRunner(testReplInstance);
    //     testRunner.updateEnv(settingsStore!.consoleEnv);
        
    //     // Create console and testRunner env sync
    //     this._consoleSyncDisposer = autorun(() =>  {
    //         testRunner.updateEnv(settingsStore!.consoleEnv);

    //         testReplInstance.updateEnv(settingsStore!.consoleEnv);
    //     });
    // }

    // componentWillUnmount() {
    //     window.removeEventListener('message', this.handleExternalCommand.bind(this));
    //     this._consoleSyncDisposer && this._consoleSyncDisposer();
    // }

    render() {
        const {
            classes,
            filesStore
        } = this.props;

        return (
            <Router>
                <div className={classes!.layout}>
                    <div className={classes!.layout_workPanel}>
                        <div className="sidePanel">
                            <div className="sidePanel_header">
                                <div className="logo"></div>
                            </div>

                            <div className="sidePanel_content">
                                <div className="explorer"></div>
                            </div>

                            <div className="sidePanel_footer">
                                <div className="actionBar"></div>
                            </div>
                        </div>

                        <div className="mainPanel">
                            <div className="mainPanel_header">
                                <div className="tabs"></div>
                                <div className="account"></div>
                                <div className="settings"></div>
                            </div>

                            <div className="mainPanel_content">
                                <div className="editor"></div>
                            </div>

                            <div className="mainPanel_footer">
                                <div className="actionBar"></div>
                            </div>
                        </div>
                    
                    </div>

                    <div className={classes!.layout_outputPanel}>
                    
                    </div>

                    <div className={classes!.layout_footer}>
                    
                    </div>
                </div>
{/* 
                <div className={classes!.root}>
                    <TopBar/>
                    <div className={classes!.mainField}>
                        <FileExplorer className={classes!.fileExplorer}/>
                        <div className={classes!.editorField}>
                            {filesStore!.rootStore.tabsStore.tabs.length > 0 ?
                                <React.Fragment>
                                    <EditorTabs/>
                                    <div className={classes!.editor}>
                                        <Editor/>
                                    </div>
                                </React.Fragment>
                                :
                                <Intro/>
                            }
                        </div>
                        <RightTabs className={classes!.rightTabsField}/>
                    </div>

                    <ReplWrapper theme="light" name="testRepl"/>

                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/wizard/multisig" component={WizardDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    <Route path="/txGenerator" component={TxGeneratorDialog}/>
                    <UserNotification/>
                    <UserDialog/>
                </div> */}
            </Router>
        );
    }
}

export default withStyles(styles)(App);
