import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { autorun, IReactionDisposer } from 'mobx';

import { UserNotification } from '@components/UserNotification';
import { UserDialog } from '@components/UserDialog';
import { SettingsDialog } from '../SettingsBtn/SettingsDialog';
import { WizardDialog } from '@components/WizardDialog';

import WorkPanel from '../WorkPanel';
import ReplsPanel from '../ReplsPanel';
import Footer from '../Footer';

import { FilesStore, SettingsStore, ReplsStore, FILE_TYPE, IFile } from '@stores';

import * as testRunner from '@utils/testRunner';

import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    replsStore?: ReplsStore
}


@inject('filesStore', 'settingsStore', 'replsStore')
@observer
export default class App extends React.Component<IInjectedProps> {
    private _consoleSyncDisposer?: IReactionDisposer;

    private handleExternalCommand(e: any) {
        const data = e.data;
        switch (data.command) {
            case 'CREATE_NEW_CONTRACT':
                this.props.filesStore!.createFile({
                    type: data.fileType || FILE_TYPE.RIDE,
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

        return (
            <Router>
                <div className={styles.layout}>
                    <WorkPanel/>

                    <ReplsPanel className={styles!.layout_replsPanel}/>

                    <div className={styles.layout_footer}>
                        <Footer/>
                    </div>

                    {/*<UserNotification/>*/}
                    {/*<UserDialog/>*/}

                    <Route path="/settings" component={SettingsDialog}/>
                    {/*<Route path="/wizard/multisig" component={WizardDialog}/>*/}
                    {/*<Route path="/signer" component={TransactionSigningDialog}/>*/}
                    {/*<Route path="/txGenerator" component={TxGeneratorDialog}/>*/}
                </div>
            </Router>
        );
    }
}
