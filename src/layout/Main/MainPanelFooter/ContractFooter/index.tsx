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

    handleDeploy = () => {
        const { signerStore, history } = this.props;

        const txTemplate = signerStore!.setScriptTemplate;

        if (txTemplate) {
            signerStore!.setTxJson(txTemplate);
            history.push('/signer');
        }
    };

    handleIssue = () => {
        const { file, signerStore, history } = this.props;

        const issueTemplate = signerStore!.issueTemplate;

        if (issueTemplate && file.info.type === 'asset') {
            signerStore!.setTxJson(issueTemplate);
            history.push('/signer');
        }
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
        
        let copyBase64Handler, issueHandler, deployHandler;
        if ('result' in file.info.compilation) {
            const base64 = file.info.compilation.result.base64;
            copyBase64Handler = () => this.handleCopyBase64(base64);
        }
        
        const isAsset = (file: IRideFile) => file.info.type === 'asset';
        const isLib = (file: IRideFile) => file.info.type === 'library';

        const hiddenButtons: JSX.Element[] = [], buttons: JSX.Element[] = [];
        const buttonMap = [
            {cond: !file.readonly, btn: <ShareFileButton key={1} file={file}/>},
            {cond: !isLib(file), btn: <CopyBase64Button key={2} copyBase64Handler={copyBase64Handler}/>},
            {cond: !isLib(file), btn: <DeployButton key={4} deployHandler={this.handleDeploy} type={file.info.type}/>},
            {cond: isAsset(file), btn: <IssueButton key={3} issueHandler={this.handleIssue}/>}
        ];

        buttonMap
            .filter(({cond}) => cond)
            .forEach(({cond, btn}, i) => i + 1 > Math.floor((this.state.currentWidth - 200) / 130)
                ? hiddenButtons.push(btn)
                : buttons.push(btn)
            );


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
