import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { inject, observer } from 'mobx-react';
import { issue, setAssetScript, setScript } from '@waves/waves-transactions';
import classNames from 'classnames';
import { IRideFile, SettingsStore, SignerStore} from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';
import styles from '../styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void; };

interface IInjectedProps {
    settingsStore?: SettingsStore
    signerStore?: SignerStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
    className?: string,
    file: IRideFile,
}

@inject('settingsStore', 'signerStore')
@observer
class ContractFooter extends React.Component<IProps> {

    handleDeploy = (base64: string) => {
        const {history, settingsStore, signerStore} = this.props;
        const chainId = settingsStore!.defaultNode!.chainId;
        const file = this.props.file;
        let tx;
        if (file.info.type === 'account') {
            tx = setScript({
                script: base64,
                chainId: chainId,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
            });
            delete tx.senderPublicKey;
            delete tx.id;
        }
        if (file.info.type === 'asset') {
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
        const {className, file} = this.props;
        const rootClassName = classNames(styles!.root, className);
        let base64: string, copyBase64Handler, issueHandler, deployHandler;
        if (file.content && !('error' in file.info.compiled)) {
            base64 = file.info.compiled.result.base64;
            copyBase64Handler = base64 ? () => this.handleCopyBase64(base64) : undefined;
            issueHandler = base64 && file.info.type === 'asset' ? () => this.handleIssue(base64) : undefined;
            deployHandler = base64 ? () => this.handleDeploy(base64) : undefined;
        }
        console.log(file)
        return <div className={rootClassName}>
            <div className={styles.scriptInfo}>
                <span>
                    Script size: <span className={styles!.boldText}> {file.info.size} / {file.info.maxSize} bytes</span>
                </span>
                <span>
                    Script complexity: <span className={styles!.boldText}> {file.info.estimate} / {file.info.maxComplexity}</span>
                </span>
            </div>

            <div className={styles.buttonSet}>
                <button className={styles.btn} disabled={!copyBase64Handler} onClick={copyBase64Handler}>
                    <div className="copy-12-basic-700"/>
                    Copy BASE64
                </button>
                {file.info.type === 'asset' &&
                <button className={styles['btn-primary']} disabled={!issueHandler} onClick={issueHandler}>
                    Issue token
                </button>
                }
                <button className={styles['btn-primary']} disabled={!deployHandler} onClick={deployHandler}>
                    Deploy {this.props.file.info.type}script
                </button>
            </div>
        </div>;
    }
}

export default (withRouter(ContractFooter));
