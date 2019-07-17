import * as React from 'react';
import { Route, Router } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import SettingsDialog from '@src/components/Dialogs/SettingsDialog';
import WorkPanel from '../WorkPanel';
import ReplsPanel from '../ReplsPanel';
import Footer from '../Footer';

import { FILE_TYPE, FilesStore, ReplsStore, SettingsStore } from '@stores';

import styles from './styles.less';
import testRunner from '@services/testRunner';
import TransactionSigningDialog from '@src/components/Dialogs/TransactionSigning';
import { History } from 'history';

interface IInjectedProps {
    history: History

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

        const {filesStore} = this.props;
        const fileContent = filesStore!.getFileContent;
        // Add file function to test runner
        testRunner.updateEnv({file: fileContent});
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleExternalCommand.bind(this));
    }

    render() {

        return (
            <Router history={this.props.history}>
                <div className={styles.layout}>
                    <WorkPanel/>

                    <ReplsPanel resizeSide="top"/>

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
