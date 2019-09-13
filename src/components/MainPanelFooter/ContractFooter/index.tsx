import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IRideFile, SettingsStore, SignerStore } from '@stores';
import classNames from 'classnames';
import Button from '@src/components/Button';
import { copyToClipboard } from '@utils/copyToClipboard';
import styles from '../styles.less';
import ShareFileButton from '@components/MainPanelFooter/ShareFileButton';
import { NotificationService } from '@services/notificationService';

interface IInjectedProps {
    settingsStore?: SettingsStore
    signerStore?: SignerStore
    notificationService?: NotificationService
}

interface IProps extends IInjectedProps, RouteComponentProps {
    className?: string,
    file: IRideFile,
}

@inject('settingsStore', 'signerStore', 'notificationService')
@observer
class ContractFooter extends React.Component<IProps> {

    handleDeploy = (tx: string) => () => {
        this.props.signerStore!.setTxJson(tx);
        this.props.history.push('/signer');
    };

    handleIssue = (tx: string) => {
        this.props.signerStore!.setTxJson(tx);
        this.props.history.push('signer');
    };

    handleCopyBase64 = (base64: string) => {
        if (copyToClipboard(base64)) {
            this.props.notificationService!.notify('Copied!',
                {key: 'copy-base64', duration: 1, closable: false});
        }
    };

    render() {
        const {className, file, signerStore} = this.props;
        const rootClassName = classNames(styles!.root, className);
        const txTemplate = signerStore!.setScriptTemplate;
        const issueTemplate = signerStore!.issueTemplate;

        let copyBase64Handler, issueHandler, deployHandler;
        if ('result' in file.info.compilation) {
            const base64 = file.info.compilation.result.base64;
            copyBase64Handler = () => this.handleCopyBase64(base64);
        }
        deployHandler = txTemplate ? this.handleDeploy(txTemplate) : undefined;
        issueHandler = issueTemplate && file.info.type === 'asset' ? () => this.handleIssue(issueTemplate) : undefined;


        return <div className={rootClassName}>
            <div className={styles.scriptInfo}>
                <span>
                    Script size: <span className={styles!.boldText}> {file.info.size} / {file.info.maxSize} bytes</span>
                </span>
                <span>
                    Script complexity:
                    <span className={styles!.boldText}> {file.info.complexity} / {file.info.maxComplexity}</span>
                </span>
            </div>

            <div className={styles.buttonSet}>

                {!file.readonly && <ShareFileButton file={file}/>}

                {file.info.type !== 'library' && <CopyBase64Button copyBase64Handler={copyBase64Handler}/>}

                {file.info.type === 'asset' && <IssueButton issueHandler={issueHandler}/>}

                {file.info.type !== 'library' && <DeployButton deployHandler={deployHandler} type={file.info.type}/>}

            </div>
        </div>;
    }
}

const CopyBase64Button = ({copyBase64Handler}: { copyBase64Handler?: () => void }) =>
    <Button type="action-gray" disabled={!copyBase64Handler}
            onClick={copyBase64Handler}
            title="Copy base64 compiled script to clipboard"
            icon={<div className={styles.copy18}/>}
    >
        BASE64
    </Button>;

const IssueButton = ({issueHandler}: { issueHandler?: () => void }) =>
    <Button type="action-blue"
            disabled={!issueHandler}
            onClick={issueHandler}
            title="Generate Issue transaction">
        Issue
    </Button>;

const DeployButton = ({deployHandler, type}: { deployHandler?: () => void, type: string }) =>
    <Button type="action-blue"
            disabled={!deployHandler}
            onClick={deployHandler}
            title={`Generate ${type === 'asset' ? 'SetAssetScript' : 'SetScript'} transaction`}>
        Deploy
    </Button>;


export default withRouter(ContractFooter);
