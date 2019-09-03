import * as React from 'react';
import { Route, Router } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import TransactionSigningDialog from '@src/components/Dialogs/TransactionSigning';
import SettingsDialog from '@src/components/Dialogs/SettingsDialog';
import ImportAccountDialog from '@components/Dialogs/ImportAccountDialog';
import Footer from '@components/Footer';
import WorkPanel from '@components/WorkPanel';
import ReplsPanel from '@components/ReplsPanel';
import { FILE_TYPE, FilesStore, ReplsStore, SettingsStore } from '@stores';
import styles from './styles.less';

interface IInjectedProps {
    history: History
    filesStore?: FilesStore
    settingsStore?: SettingsStore,
    replsStore?: ReplsStore,
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
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleExternalCommand.bind(this));
    }

    render() {
        return (
            <Router history={this.props.history}>
                <div className={styles.layout}>
                    <WorkPanel/>
                    <ReplsPanel storeKey="repl" resizeSide="top" closedSize={48} minSize={200}/>
                    <Footer/>

                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    <Route path="/importAccount" component={ImportAccountDialog}/>
                </div>
            </Router>
        );
    }
}
