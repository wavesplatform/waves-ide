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
import { StyledComponentProps, Theme, withStyles } from '@material-ui/core/styles';
import { FilesStore, SettingsStore, ReplsStore, FILE_TYPE, IFile } from '@stores';
import { autorun, IReactionDisposer } from 'mobx';

import * as testRunner from '@utils/testRunner';

const styles = (theme: Theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgb(248, 249, 251)',
    },

    mainField: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        minHeight: 0
    },
    fileExplorer: {
        borderRight: '2px solid #E5E7E9',
        //Todo: this fixes https://github.com/mui-org/material-ui/issues/12524. Should make this example https://codesandbox.io/s/n5lowo693m always fail and write on github thread
        flexShrink: 0,
        //maxWidth: '13%'
    },
    editorField: {
        height: '100%',
        flex: '1 1 auto',
        overflow: 'hidden',
        margin: '0 1% 0 0%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
    },
    editor: {
        flex: 1,
        overflow: 'hidden',
        // height: '100%',
        // width: '100%',
        padding: '6px',
        // border: '1px solid red'
        //overflowY: 'auto'
    },
    rightTabsField: {
        height: '100%',
        maxWidth: '25%',
        backgroundColor: 'white',
    }
});


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
export class AppComponent extends React.Component<IAppProps> {
    private _consoleSyncDisposer?: IReactionDisposer;

    private handleExternalCommand(e: any) {
        const data = e.data;
        switch (data.command) {
            case 'CREATE_NEW_CONTRACT':
                this.props.filesStore!.createFile({
                    type: data.fileType || FILE_TYPE.ACCOUNT_SCRIPT,
                    content: data.code,
                    name: data.label
                });

                e.source.postMessage({command: data.command, status: 'OK'}, e.origin);
                break;
        }
    }

    getTestReplInstance() {
        const { replsStore } = this.props;

        const testRepl = replsStore!.repls['testRepl'];

        return testRepl.instance;
    }

    componentDidMount() {
        const { settingsStore, filesStore } = this.props;

        // Bind external command
        window.addEventListener('message', this.handleExternalCommand.bind(this));

        //Create and bind to console function, responsible for getting file content
        const fileContent = (fileName?: string) => {
            let file: IFile | undefined;
            if (!fileName) {
                file = filesStore!.currentFile;
                if (file == null) throw new Error('No file opened in editor');
            }else {
                file = filesStore!.files.find(file => file.name === fileName);
                if (file == null) throw new Error(`No file with name ${fileName}`);
            }

            return file.content;
        };

        const testReplInstance = this.getTestReplInstance();
        testReplInstance.updateEnv({file: fileContent});

        testRunner.bindReplAPItoRunner(testReplInstance);
        testRunner.updateEnv(settingsStore!.consoleEnv);
        
        // Create console and testRunner env sync
        this._consoleSyncDisposer = autorun(() =>  {
            testRunner.updateEnv(settingsStore!.consoleEnv);

            testReplInstance.updateEnv(settingsStore!.consoleEnv);
        });
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleExternalCommand.bind(this));
        this._consoleSyncDisposer && this._consoleSyncDisposer();
    }

    render() {
        const {classes, filesStore} = this.props;

        return (
            <Router>
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
                </div>
            </Router>
        );
    }
}

export const App = withStyles(styles as any)(AppComponent);
