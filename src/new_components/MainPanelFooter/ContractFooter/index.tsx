import React from 'react';
import ScriptComplexity from './ScriptComplexity';
import styles from '../styles.less';
import { FILE_TYPE, FilesStore, IFile, SettingsStore, SignerStore } from '@stores';
import { issue, setAssetScript, setScript } from '@waves/waves-transactions';
import * as RideJS from '@waves/ride-js';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';

type TNotification = { notice: (arg0: { content: string; }) => void; };


interface IContractFooterProps {
    className: string,
    file: IFile,
}

interface IInjectedProps {
    filesStore?: FilesStore
    settingsStore?: SettingsStore
    signerStore?: SignerStore
}

interface IProps extends IInjectedProps, RouteComponentProps, IContractFooterProps {
}


@inject('filesStore', 'settingsStore', 'signerStore')
@observer
class ContractFooter extends React.Component<IProps> {

    handleDeploy = (base64: string) => {
        const {history, settingsStore, signerStore} = this.props;
        const chainId = settingsStore!.defaultNode!.chainId;
        const file = this.props.file;
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

    handleCopyBase64 = (base64: string) => {
        if (copyToClipboard(base64)) {
            notification.newInstance({}, (notification: TNotification) => {
                notification.notice({content: 'Copied!'});
            });
        }
    };

    render() {
        const {className, file, filesStore} = this.props;
        let nodeUrl, base64: any, scriptSize, copyBase64Handler, issueHandler, deployHandler;

        if (file.content) {
            const compilationResult = RideJS.compile(file.content);
            if (!('error' in compilationResult)) {
                scriptSize = compilationResult.result.size;
                base64 = compilationResult.result.base64;
                // Todo: default node!!
                nodeUrl = filesStore!.rootStore.settingsStore.defaultNode!.url;
                copyBase64Handler = base64 ? () => this.handleCopyBase64(base64) : undefined;
                issueHandler =
                    base64 && file.type === FILE_TYPE.ASSET_SCRIPT ? () => this.handleIssue(base64) : undefined;
                deployHandler = base64 ? () => this.handleDeploy(base64) : undefined;
            }
        }

        return <footer className={className}>
            <ScriptComplexity nodeUrl={nodeUrl} base64={base64} scriptSize={scriptSize}/>

            <div className={styles.right}>
                <button className={styles.btn} disabled={!copyBase64Handler} onClick={copyBase64Handler}>
                    Copy BASE64
                </button>
                <button className={styles['btn-primary']} disabled={!issueHandler} onClick={issueHandler}>
                    Issue token
                </button>
                <button className={styles['btn-primary']} disabled={!deployHandler} onClick={deployHandler}>
                    Deploy accountscript
                </button>
            </div>
        </footer>;
    }
}

export default (withRouter(ContractFooter));
