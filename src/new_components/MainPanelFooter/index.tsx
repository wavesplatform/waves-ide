import React from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as RideJS from '@waves/ride-js';
import { issue, setAssetScript, setScript } from '@waves/waves-transactions';
import { notification } from 'antd';

import { FilesStore, FILE_TYPE, IFile, SettingsStore, SignerStore, NotificationsStore } from '@stores';

import { copyToClipboard } from '@utils/copyToClipboard';

import TestRunner from '@components/RightTabs/TestRunner';
import FooterContainer from './FooterContainer';

import './style.css';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore
    signerStore?: SignerStore
    notificationsStore?: NotificationsStore
}

interface IFooterProps extends IInjectedProps, RouteComponentProps {
}

@inject('filesStore', 'settingsStore', 'signerStore', 'notificationsStore')
@observer
class MainPanelFooter extends React.Component <IFooterProps> {

    handleDeploy = (base64: string, file: IFile) => {
        const {history, settingsStore, signerStore} = this.props;
        const chainId = settingsStore!.defaultNode!.chainId;

        let tx;
        if (file.type === FILE_TYPE.ACCOUNT_SCRIPT) {
            tx = setScript({
                script: base64,
                chainId: chainId,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
            });
            delete tx.senderPublicKey;
            delete tx.id;
        }
        if (file.type === FILE_TYPE.ASSET_SCRIPT) {
            tx = setAssetScript({
                assetId: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', //Dummy assetId
                script: base64,
                chainId: chainId,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', // Dummy senderPk Only to create tx
            });
            delete tx.senderPublicKey;
            delete tx.assetId;
            delete tx.id;
        }

        if (tx != null) {
            signerStore!.setTxJson(JSON.stringify(tx, null, 2));
            history.push('signer');
        }
    };

    handleIssue = (base64: string) => {
        const {history, settingsStore, signerStore} = this.props;
        const chainId = settingsStore!.defaultNode!.chainId;

        const tx = issue({
            script: 'base64:' + base64,
            name: 'test',
            description: 'test',
            quantity: 1000,
            reissuable: true,
            chainId: chainId,
            senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
        });
        delete tx.senderPublicKey;
        delete tx.id;
        delete tx.description;
        delete tx.name;
        delete tx.quantity;

        signerStore!.setTxJson(JSON.stringify(tx, null, 2));
        history.push('signer');
    };
    
    render() {
        const {filesStore} = this.props;

        const file = filesStore!.currentFile;

        if (!file || !file.content) {
            return <FooterContainer/>;
        }

        if (file.type === FILE_TYPE.TEST) {
            return <TestRunner/>;
        }

        const compilationResult = RideJS.compile(file.content);

        if ('error' in compilationResult) {
            return <FooterContainer/>;
        }

        const base64 = compilationResult.result.base64 || '';

        // Todo: default node!!
        const nodeUrl = filesStore!.rootStore.settingsStore.defaultNode!.url;

        return (
            <div className={styles!.root}>
                <div className={styles!.left}>
                
                </div>
                <div className={styles!.right}>
                
                </div>
                {/* <FooterContainer
                    scriptSize={compilationResult.result.size}
                    base64={base64}
                    nodeUrl={nodeUrl}
                    copyBase64Handler={() => {
                        if (copyToClipboard(base64)) {
                            notification['success']({message: 'Copied!'});
                        }
                    }}
                    issueHandler={file.type === FILE_TYPE.ASSET_SCRIPT ? (() => this.handleIssue(base64)) : undefined}
                    deployHandler={() => this.handleDeploy(base64, file)}
                /> */}
            </div>

        );
    }
}

export default (withRouter(MainPanelFooter));
