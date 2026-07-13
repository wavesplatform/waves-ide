import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import TransactionSigningDialog from './Dialogs/TransactionSigning';
import SettingsDialog from './Dialogs/SettingsDialog';
import ImportAccountDialog from './Dialogs/ImportAccountDialog';
import Footer from './Footer';
import Main from './Main';
import Bottom from './Bottom';
import SidePanel from './SidePanel';
import { FILE_TYPE, FilesStore, SettingsStore, NewsStore } from '@stores';
import styles from './styles.less';
import { version } from '@waves/ride-js';
import MigrationDialog from '@src/layout/Dialogs/MigrationDialog';
import ImportStateDialog from '@src/layout/Dialogs/ImportStateDialog';
import NewsPanel from '@components/NewsPanel';
import { isDepricatedHost } from '@utils/hosts';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore
    newsStore?: NewsStore
}

@inject('filesStore', 'settingsStore', 'newsStore')
@observer
export default class App extends React.Component<IInjectedProps> {
    private handleExternalCommand(e: any) {
        const data = e.data;
        if (data.command === 'CREATE_NEW_CONTRACT') {
            this.props.filesStore!.createFile({
                type: data.fileType || FILE_TYPE.RIDE,
                content: data.code,
                name: data.label
            }).then(() => e.source.postMessage({command: data.command, status: 'OK'}, e.origin));
        }
    }

    componentDidMount() {
        // Bind external command
        window.addEventListener('message', this.handleExternalCommand.bind(this));

        console.log(`RIDE compiler version: ${version}`);
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleExternalCommand.bind(this));
    }

    render() {
        const { newsStore } = this.props

        return (
            <ThemeHandler theme={this.props.settingsStore!.theme}>
                <BrowserRouter>
                    <div className={styles.layout}>
                        <div className={styles.sideAndMain}>
                            <SidePanel storeKey="explorer" resizeSide="right" closedSize={24} minSize={225}/>
                            <Main/>
                        </div>
                        <Bottom storeKey="repl" resizeSide="top" closedSize={48} minSize={200}/>
                        <Footer/>

                        {isDepricatedHost &&  <MigrationDialog/>}

                        {newsStore?.isNewsPanelVisible && <NewsPanel/>}

                        <Routes>
                            <Route path="/settings" element={<SettingsDialog/>}/>
                            <Route path="/importState" element={<ImportStateDialog/>}/>
                            <Route path="/signer" element={<TransactionSigningDialog/>}/>
                            <Route path="/importAccount" element={<ImportAccountDialog/>}/>
                            <Route path="*" element={null}/>
                        </Routes>
                    </div>
                </BrowserRouter>
            </ThemeHandler>
        );
    }
}

interface IThemeHandlerProps {
    theme: string
    children?: React.ReactNode
}

const ThemeHandler: React.FC<IThemeHandlerProps> = (props) => {
    useEffect(() => document.documentElement.setAttribute('data-theme', props.theme));
    return <>{props.children}</>;
};

