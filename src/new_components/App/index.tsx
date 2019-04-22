import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { UserNotification } from '@components/UserNotification';
import { UserDialog } from '@components/UserDialog';
import { WizardDialog } from '@components/WizardDialog';

import SettingsDialog from '@src/new_components/Dialogs/SettingsDialog';
import WorkPanel from '../WorkPanel';
import ReplsPanel from '../ReplsPanel';
import Footer from '../Footer';

import { FilesStore, SettingsStore, ReplsStore, FILE_TYPE } from '@stores';

import styles from './styles.less';
import testRunner from '@services/testRunner';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    replsStore?: ReplsStore
}

@inject('filesStore', 'settingsStore', 'replsStore')
@observer
export default class App extends React.Component<IInjectedProps> {
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

    componentDidMount() {
        // Bind external command
        window.addEventListener('message', this.handleExternalCommand.bind(this));

        const { filesStore } = this.props;
        const fileContent = filesStore!.getFileContent;
        // Add file function to test runner
        testRunner.updateEnv({file: fileContent});
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleExternalCommand.bind(this));
    }

    render() {

        return (
            <Router>
                <div className={styles.layout}>
                    <WorkPanel/>

                    <ReplsPanel/>

                    <Footer/>

                    {/*<UserNotification/>*/}
                    {/*<UserDialog/>*/}

                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    {/*<Route path="/wizard/multisig" component={WizardDialog}/>*/}
                    {/*<Route path="/txGenerator" component={TxGeneratorDialog}/>*/}
                </div>
            </Router>
        );
    }
}
