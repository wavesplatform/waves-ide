import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IRideFile, NotificationsStore, SettingsStore, SignerStore } from '@stores';
import classNames from 'classnames';
import Button from '@src/components/Button';
import copyToClipboard from 'copy-to-clipboard';
import styles from '../styles.less';
import ShareFileButton from '../ShareFileButton';
import Dropdown from '@components/Dropdown';
import ReactResizeDetector from 'react-resize-detector';

interface IInjectedProps {
    settingsStore?: SettingsStore
    signerStore?: SignerStore
    notificationsStore?: NotificationsStore
}

interface IProps extends IInjectedProps, RouteComponentProps {
    className?: string,
    file: IRideFile,
}

interface IState {
    currentWidth: number
}

@inject('settingsStore', 'signerStore', 'notificationsStore')
@observer
class ContractFooter extends React.Component<IProps, IState> {
    state = {
        currentWidth: 0
    }

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
            this.props.notificationsStore!.notify('Copied!',
                {key: 'copy-base64', duration: 1, closable: false, type: 'success'});
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

        const buttons: JSX.Element[] = [];

        !file.readonly && buttons.push(<ShareFileButton key={1} file={file}/>);
        file.info.type !== 'library' && buttons.push(<CopyBase64Button key={2} copyBase64Handler={copyBase64Handler}/>);
        file.info.type === 'asset' && buttons.push(<IssueButton key={3} issueHandler={issueHandler}/>);
        file.info.type !== 'library' && buttons.push(<DeployButton key={4} deployHandler={deployHandler}
                                                                   type={file.info.type}/>);
        //200

        const count = Math.floor((this.state.currentWidth - 200) / 130);
        const length = buttons.length - (count > buttons.length ? buttons.length : count)
        const hiddenButtons = Array.from({length}, () => buttons.pop());

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
            <ReactResizeDetector handleWidth onResize={width => this.setState({currentWidth: width})}/>
            <div className={styles.buttonSet}>
                {buttons}
                {hiddenButtons.length > 0 && <Dropdown
                    trigger={['click']}
                    menuClassName={styles.dropdownBtn}
                    overlay={<div className={styles.dropdown}>{hiddenButtons}</div>}
                    button={<div className={styles['hidden-tabs-btn']}>
                        <div className={styles.listIcn}/>
                    </div>}
                />}
            </div>


        </div>;
    }
}

const CopyBase64Button: React.FunctionComponent<{ copyBase64Handler?: () => void }> = ({copyBase64Handler}) =>
    <Button type="action-gray" disabled={!copyBase64Handler}
            onClick={copyBase64Handler}
            title="Copy base64 compiled script to clipboard"
            icon={<div className={styles.copy18}/>}
    >
        BASE64
    </Button>;

const IssueButton: React.FunctionComponent<{ issueHandler?: () => void }> = ({issueHandler}) =>
    <Button type="action-blue"
            disabled={!issueHandler}
            onClick={issueHandler}
            title="Generate Issue transaction">
        Issue
    </Button>;

const DeployButton: React.FunctionComponent<{ deployHandler?: () => void, type: string }> = ({deployHandler, type}) =>
    <Button type="action-blue"
            disabled={!deployHandler}
            onClick={deployHandler}
            title={`Generate ${type === 'asset' ? 'SetAssetScript' : 'SetScript'} transaction`}>
        Deploy
    </Button>;


export default withRouter(ContractFooter);
