import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { autorun, IReactionDisposer } from 'mobx';
import withStyles, { StyledComponentProps } from 'react-jss';

import { UserNotification } from '@components/UserNotification';
import { UserDialog } from '@components/UserDialog';
import { SettingsDialog } from '@components/SettingsDialog';
import { WizardDialog } from '@components/WizardDialog';
import ReplWrapper from '@components/ReplWrapper';
import { TransactionSigningDialog } from '@components/TransactionSigning';
import { TxGeneratorDialog } from '@components/TxGeneratorDialog';
import WorkPanel from '../WorkPanel';
import ReplsPanelResizableWrapper from '../ReplsPanelResizableWrapper';

import { FilesStore, SettingsStore, ReplsStore } from '@stores';
import { FILE_TYPE, IFile } from '@src/types';

import * as testRunner from '@utils/testRunner';

import styles from './styles';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    replsStore?: ReplsStore
}

interface IAppProps extends
    StyledComponentProps<keyof ReturnType<typeof styles>>,
    IInjectedProps {}

@inject('filesStore', 'settingsStore', 'replsStore')
@observer
class App extends React.Component<IAppProps> {
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
        const { classes } = this.props;

        return (
            <Router>
                <div className={classes!.layout}>
                    <div className={classes!.layout_workPanel}>
                        <WorkPanel/>
                    </div>

                    <div className={classes!.layout_replsPanel}>
                        <ReplsPanelResizableWrapper>
                            <ReplWrapper theme="light" name="testRepl"/>
                        </ReplsPanelResizableWrapper>
                    </div>

                    <div className={classes!.layout_footer}>
                        layout_footer
                    </div>
                    
                    <UserNotification/>
                    <UserDialog/>

                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/wizard/multisig" component={WizardDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    <Route path="/txGenerator" component={TxGeneratorDialog}/>
                </div>
                {/* 
                <div className={classes!.root}>
                    <TopBar/>
                    <div className={classes!.mainField}>
                        <RightTabs className={classes!.rightTabsField}/>
                    </div>
                </div> */}
            </Router>
        );
    }
}

export default withStyles(styles)(App);
