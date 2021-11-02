import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IRideFile, FilesStore, NotificationsStore, SettingsStore, SignerStore } from '@stores';
import { RIDE_CONTENT_TYPE, RIDE_SCRIPT_TYPE } from '@stores/File';
import classNames from 'classnames';
import Button from '@src/components/Button';
import copyToClipboard from 'copy-to-clipboard';
import styles from '../styles.less';
import ShareFileButton from '../ShareFileButton';
import Checkbox from '@components/Checkbox';
import Dropdown from '@components/Dropdown';
import ReactResizeDetector from 'react-resize-detector';
import InfoTooltip from '../../../Dialogs/SettingsDialog/Info'; // todo move to components 655

interface IInjectedProps {
    filesStore?: FilesStore,
    settingsStore?: SettingsStore,
    signerStore?: SignerStore,
    notificationsStore?: NotificationsStore,
}

interface IProps extends IInjectedProps, RouteComponentProps {
    className?: string,
    file: IRideFile,
}

interface IState {
    currentWidth: number,
}

@inject('filesStore', 'settingsStore', 'signerStore', 'notificationsStore')
@observer
class ContractFooter extends React.Component<IProps, IState> {
    state = {
        currentWidth: 0,
    };

    handleDeploy = (fileType: string) => {
        const {filesStore, settingsStore, signerStore, history} = this.props;

        const asyncDeploy = async () => {
            await filesStore!.syncCurrentFileInfo(settingsStore?.isCompaction, settingsStore?.isRemoveUnusedCode);
            const txTemplate = fileType === 'expression' ? signerStore!.expressionTemplate : signerStore!.setScriptTemplate;

            if (txTemplate) {
                signerStore!.setTxJson(txTemplate);
                history.push('/signer');
            }
        };

        asyncDeploy();
    };

    handleIssue = () => {
        const {file, signerStore, history, settingsStore} = this.props;

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

    onChangeCompaction = () => {
        this.props.settingsStore?.toggleIsCompaction();
    }

    onChangeRemoveUnusedCode = () => {
        this.props.settingsStore?.toggleIsRemoveUnusedCode();
    }

    render() {
        const state = this.state;
        const {className, file, settingsStore} = this.props;
        const rootClassName = classNames(styles!.root, className);

        let copyBase64Handler;

        if (file.info.compilation.base64) {
            const base64 = file.info.compilation.base64;
            copyBase64Handler = () => this.handleCopyBase64(base64);
        }

        const isAsset = (file: IRideFile) => file.info.type === 'asset';
        const isExpression = (file: IRideFile) => file.info.type === 'expression';
        const isLib = (file: IRideFile) => file.info.type === 'library';

        const hiddenButtons: JSX.Element[] = [], buttons: JSX.Element[] = [];
        const buttonMap = [
            {cond: !file.readonly, btn: <ShareFileButton key={1} file={file}/>},
            {cond: !isLib(file), btn: <CopyBase64Button key={2} copyBase64Handler={copyBase64Handler}/>},
            {cond: !isLib(file), btn: <DeployButton key={4} deployHandler={() => this.handleDeploy(file.info.type)} type={file.info.type}/>},
            {cond: isAsset(file), btn: <IssueButton key={3} issueHandler={this.handleIssue}/>},
        ];

        const compilationSettindsWidth = 270;
        buttonMap
            .filter(({cond}) => cond)
            .forEach(({cond, btn}, i) => i + 1 > Math.floor((this.state.currentWidth - (200+compilationSettindsWidth)) / 130)
                ? hiddenButtons.push(btn)
                : buttons.push(btn)
            );

        const {
            type,
            maxSize,
            compilation,
            contentType,
            maxComplexity,
            maxCallableComplexity,
            maxAccountVerifierComplexity,
            maxAssetVerifierComplexity,
            scriptType,
        } = file.info;
        let largestFuncComplexity = Math.max.apply(null, Object.values({}));
        if (!isFinite(largestFuncComplexity)) largestFuncComplexity = 0;

        const size = compilation.size || 0;
        const complexity = compilation.complexity || 0;
        const verifierComplexity = compilation.verifierComplexity || 0;
        const stateCallsComplexities = Object.values(compilation.stateCallsComplexities || {}).reduce((acc, x) => acc += x, 0);


        const complexityStatus = (value: number, maxValue: number, title: string) => {
            return (
                <span>
                    {title}:&nbsp;
                    <span className={styles!.boldText}>
                        <span style={{color: value > maxValue ? '#e5494d' : undefined}}>{value}</span>
                        <span>&nbsp;/&nbsp;</span>
                        <span>{maxValue}</span>
                    </span>
                </span>
            );
        };

        return <div className={rootClassName}>
            <div className={styles.scriptInfo}>
                <span>
                    Script size:&nbsp;
                    <span className={styles!.boldText}>
                        <span style={{color: size > maxSize ? '#e5494d' : undefined}}>
                            {size}
                        </span>
                        &nbsp;/&nbsp;{maxSize} bytes
                    </span>
                </span>
                {contentType === RIDE_CONTENT_TYPE.DAPP ? (
                    <>
                        {complexityStatus(complexity, maxCallableComplexity, 'Script complexity')}
                        {complexityStatus(verifierComplexity, maxAccountVerifierComplexity, 'Verifier complexity')}
                        {complexityStatus(stateCallsComplexities, 4000, 'State Calls Complexity')}
                    </>
                ) : undefined}
                {contentType === RIDE_CONTENT_TYPE.EXPRESSION ? (
                    <>
                        {complexityStatus(
                            complexity,
                            scriptType === RIDE_SCRIPT_TYPE.ACCOUNT ? maxAccountVerifierComplexity : maxAssetVerifierComplexity,
                            'Verifier complexity'
                        )}
                    </>
                ) : undefined}
            </div>
            <div className={styles.compileConfig}>
                <Checkbox
                    onSelect={this.onChangeCompaction}
                    selected={!!settingsStore?.isCompaction}
                />&nbsp;&nbsp;<span onClick={this.onChangeCompaction}>Compaction</span>
                &nbsp;<InfoTooltip infoType='CompileCompaction' />
                &nbsp;&nbsp;
                <Checkbox
                    onSelect={this.onChangeRemoveUnusedCode}
                    selected={!!settingsStore?.isRemoveUnusedCode}
                />&nbsp;&nbsp;<span onClick={this.onChangeRemoveUnusedCode}>Remove unused code</span>
                &nbsp;<InfoTooltip infoType='CompileRemoveUnusedCode' />
            </div>
            <ReactResizeDetector handleWidth onResize={width => this.setState({ currentWidth: width })}/>
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

const Info: React.FunctionComponent<{ text: string }> = ({ text }) =>
    <div className={styles.compileConfigInfo}>{text}</div>

export default withRouter(ContractFooter);
