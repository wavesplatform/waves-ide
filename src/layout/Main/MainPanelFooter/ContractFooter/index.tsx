import React from 'react';
import { inject, observer } from 'mobx-react';
import { IRideFile, FilesStore, NotificationsStore, SettingsStore, SignerStore } from '@stores';
import { RIDE_CONTENT_TYPE, RIDE_SCRIPT_TYPE } from '@stores/File';
import classNames from 'classnames';
import Button from '@src/components/Button';
import styles from '../styles.less';
import ShareFileButton from '../ShareFileButton';
import Checkbox from '@components/Checkbox';
import Dropdown from '@components/Dropdown';
import { useResizeDetector } from 'react-resize-detector';
import InfoTooltip from '../../../Dialogs/SettingsDialog/Info';
import { IRouteComponentProps, withRouter } from '@utils/withRouter';
import { copySync } from '@utils/copyText';

interface IInjectedProps {
    filesStore?: FilesStore,
    settingsStore?: SettingsStore,
    signerStore?: SignerStore,
    notificationsStore?: NotificationsStore,
}

interface IProps extends IInjectedProps, IRouteComponentProps {
    className?: string,
    file: IRideFile,
}

interface IState {
    currentWidth: number,
}

/**
 * ✅ Исправленный ResizeHandler:
 * - НЕ зависит от onResize
 * - нормализует width
 * - не стреляет лишний раз
 */
const ResizeHandler = ({
                           onResize,
                           children
                       }: {
    onResize: (width: number) => void;
    children: React.ReactNode;
}) => {
    const { width, ref } = useResizeDetector({
        handleWidth: true,
        refreshMode: 'throttle',
        refreshRate: 100
    });

    const lastWidthRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (typeof width !== 'number') return;

        const normalized = Math.round(width);

        if (lastWidthRef.current !== normalized) {
            lastWidthRef.current = normalized;
            onResize(normalized);
        }
    }, [width]); // ❗ УБРАЛИ onResize

    return <div ref={ref} style={{ height: '100%', width: '100%' }}>{children}</div>;
};

@inject('filesStore', 'settingsStore', 'signerStore', 'notificationsStore')
@observer
class ContractFooter extends React.Component<IProps, IState> {
    state = {
        currentWidth: 0,
    };

    // ✅ СТАБИЛЬНЫЙ обработчик
    onResize = (width: number) => {
        if (width !== this.state.currentWidth) {
            this.setState({ currentWidth: width });
        }
    };

    handleDeploy = () => {
        const { filesStore, signerStore, history, file } = this.props;

        const asyncDeploy = async () => {
            await filesStore!.syncCurrentFileInfo(file.isCompaction, file.isRemoveUnusedCode);
            const txTemplate = signerStore!.setScriptTemplate;

            if (txTemplate) {
                signerStore!.setTxJson(txTemplate);
                history.push('/signer');
            }
        };

        asyncDeploy();
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
        if (copySync(base64)) {
            this.props.notificationsStore!.notify('Copied!',
                { key: 'copy-base64', duration: 1, closable: false, type: 'success' });
        }
    };

    onChangeCompaction = () => {
        this.props.file.toggleIsCompaction();
    };

    onChangeRemoveUnusedCode = () => {
        this.props.file.toggleIsRemoveUnusedCode();
    };

    render() {
        console.count('ContractFooter render');

        const { filesStore, className } = this.props;
        const file = filesStore?.currentFile as IRideFile;

        if (!file || file.type !== 'ride') return null;

        const rootClassName = classNames(styles!.root, className);

        let copyBase64Handler;
        if (file.info.compilation.base64) {
            const base64 = file.info.compilation.base64;
            copyBase64Handler = () => this.handleCopyBase64(base64);
        }

        const isAsset = file.info.type === 'asset';
        const isLib = file.info.type === 'library';

        const hiddenButtons: React.JSX.Element[] = [];
        const buttons: React.JSX.Element[] = [];

        const buttonMap = [
            { cond: !file.readonly, btn: <ShareFileButton key={1} file={file} /> },
            { cond: !isLib, btn: <CopyBase64Button key={2} copyBase64Handler={copyBase64Handler} /> },
            { cond: !isLib, btn: <DeployButton key={4} deployHandler={this.handleDeploy} type={file.info.type} /> },
            { cond: isAsset, btn: <IssueButton key={3} issueHandler={this.handleIssue} /> }
        ];

        const compilationSettingsWidth = 270;
        const currentWidth = this.state.currentWidth || 1000;

        buttonMap
            .filter(({ cond }) => cond)
            .forEach(({ btn }, i) => {
                const shouldHide = i + 1 > Math.floor((currentWidth - (200 + compilationSettingsWidth)) / 130);
                shouldHide ? hiddenButtons.push(btn) : buttons.push(btn);
            });

        const {
            maxSize,
            compilation,
            contentType,
            maxCallableComplexity,
            maxAccountVerifierComplexity,
            maxAssetVerifierComplexity,
            scriptType,
        } = file.info;

        const size = compilation.size || 0;
        const complexity = compilation.complexity || 0;
        const verifierComplexity = compilation.verifierComplexity || 0;
        const stateCallsComplexities = Object.values(compilation.stateCallsComplexities || {}).reduce((acc, x) => acc + x, 0);

        const complexityStatus = (value: number, maxValue: number, title: string) => (
            <span>
                {title}:&nbsp;
                <span className={styles!.boldText}>
                    <span style={{ color: value > maxValue ? '#e5494d' : undefined }}>{value}</span>
                    <span>&nbsp;/&nbsp;</span>
                    <span>{maxValue}</span>
                </span>
            </span>
        );

        return (
            <div className={rootClassName}>
                <div className={styles.scriptInfo}>
                    <span>
                        Script size:&nbsp;
                        <span className={styles!.boldText}>
                            <span style={{ color: size > maxSize ? '#e5494d' : undefined }}>{size}</span>
                            <span>&nbsp;/&nbsp;{maxSize} bytes</span>
                        </span>
                    </span>

                    {contentType === RIDE_CONTENT_TYPE.DAPP && (
                        <>
                            {complexityStatus(complexity, maxCallableComplexity, 'Script complexity')}
                            {complexityStatus(verifierComplexity, maxAccountVerifierComplexity, 'Verifier complexity')}
                            {complexityStatus(stateCallsComplexities, 4000, 'State Calls Complexity')}
                        </>
                    )}

                    {contentType === RIDE_CONTENT_TYPE.EXPRESSION && (
                        <>
                            {complexityStatus(
                                complexity,
                                scriptType === RIDE_SCRIPT_TYPE.ACCOUNT ? maxAccountVerifierComplexity : maxAssetVerifierComplexity,
                                'Verifier complexity'
                            )}
                        </>
                    )}
                </div>

                <div className={styles.compileConfig}>
                    <div className={styles.compileOption}>
                        <Checkbox onSelect={this.onChangeCompaction} selected={file.isCompaction} />
                        <span className={styles.compileOptionLabel} onClick={this.onChangeCompaction}>Compaction</span>
                        <InfoTooltip infoType="CompileCompaction" />
                    </div>

                    <div className={styles.compileOption}>
                        <Checkbox onSelect={this.onChangeRemoveUnusedCode} selected={!!file.isRemoveUnusedCode} />
                        <span className={styles.compileOptionLabel} onClick={this.onChangeRemoveUnusedCode}>Remove unused code</span>
                        <InfoTooltip infoType="CompileRemoveUnusedCode" />
                    </div>
                </div>

                <ResizeHandler onResize={this.onResize}>
                    <div className={styles.buttonSet}>
                        {buttons}
                        {hiddenButtons.length > 0 && (
                            <Dropdown
                                trigger={['click']}
                                menuClassName={styles.dropdownBtn}
                                overlay={<div className={styles.dropdown}>{hiddenButtons}</div>}
                                button={
                                    <div className={styles['hidden-tabs-btn']}>
                                        <div className={styles.listIcn} />
                                    </div>
                                }
                            />
                        )}
                    </div>
                </ResizeHandler>
            </div>
        );
    }
}

const CopyBase64Button: React.FC<{ copyBase64Handler?: () => void }> = ({ copyBase64Handler }) => (
    <Button type="action-gray" disabled={!copyBase64Handler} onClick={copyBase64Handler}>
        BASE64
    </Button>
);

const IssueButton: React.FC<{ issueHandler?: () => void }> = ({ issueHandler }) => (
    <Button type="action-blue" disabled={!issueHandler} onClick={issueHandler}>
        Issue
    </Button>
);

const DeployButton: React.FC<{ deployHandler?: () => void; type: string }> = ({ deployHandler, type }) => (
    <Button type="action-blue" disabled={!deployHandler} onClick={deployHandler}>
        Deploy
    </Button>
);

export default withRouter(ContractFooter);
