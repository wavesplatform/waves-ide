import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import debounce from 'debounce';
import { schemas, schemaTypeMap, validators } from '@waves/tx-json-schemas';
import { range } from '@utils/range';
import { AccountsStore, SettingsStore, SignerStore, UIStore } from '@stores';
import { broadcast, libs, signTx } from '@waves/waves-transactions';
import { signViaKeeper } from '@utils/waveskeeper';

import MonacoEditor from 'react-monaco-editor';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import TransactionSigningForm from './TransactionSigningForm';
import styles from './styles.less';
import { DARK_THEME_ID, DEFAULT_THEME_ID } from '@src/setupMonaco';
import NotificationsStore from '@stores/NotificationsStore';
import { logToTagManager } from '@utils/logToTagManager';
import { signViaExchange } from '@utils/exchange.signer';
import { SuccessMessage } from '@src/layout/Dialogs/TransactionSigning/SuccessMessage';
import { SendingMultipleTransactions } from '@src/layout/Dialogs/SendingMultipleTransactions';


interface IInjectedProps {
    signerStore?: SignerStore;
    accountsStore?: AccountsStore;
    settingsStore?: SettingsStore;
    notificationsStore?: NotificationsStore;
    uiStore?: UIStore;
}

interface ITransactionEditorProps extends IInjectedProps, RouteComponentProps {
}

interface ITransactionEditorState {
    editorValue: string;
    proofIndex: number;
    seed: string;
    selectedAccount: number;
    signType: 'account' | 'seed' | 'wavesKeeper' | 'exchange';
    isAwaitingConfirmation: boolean;
    isMultipleSendDialogOpen: boolean;
    signedTxs: any[];
}

@inject('signerStore', 'settingsStore', 'accountsStore', 'notificationsStore', 'uiStore')
@observer
class TransactionSigning extends React.Component<ITransactionEditorProps, ITransactionEditorState> {
    private editor?: monaco.editor.ICodeEditor;
    private model?: monaco.editor.IModel;

    private showMessage = (data: JSX.Element | string, opts = {}) =>
        this.props.notificationsStore!.notify(data, {closable: true, duration: 10, ...opts});

    state: ITransactionEditorState = {
        selectedAccount: this.props.accountsStore!.activeAccountIndex,
        editorValue: this.props.signerStore!.txJson,
        proofIndex: 0,
        seed: '',
        signType: 'account',
        isAwaitingConfirmation: false,
        isMultipleSendDialogOpen: false,
        signedTxs: []
    };

    handleSign = async () => {
        if (!this.editor) return false;
        const accounts = this.props.accountsStore!.accounts;
        const {proofIndex, selectedAccount, signType, seed, editorValue} = this.state;

        const txOrTxs = libs.marshall.json.parseTx(editorValue);

        const signTxFromEditor = async (tx: any) => {
            if (!tx.chainId) tx.chainId = this.props.settingsStore!.defaultNode!.chainId.charCodeAt(0);
            let signedTx: any;

            if (signType === 'wavesKeeper') {
                this.setState({isAwaitingConfirmation: true});
                this.editor?.updateOptions({readOnly: true});
                try {
                    signedTx = await signViaKeeper(tx, proofIndex);
                } catch (e) {
                    console.error(e);
                    this.setState({isAwaitingConfirmation: false});
                    this.editor?.updateOptions({readOnly: false});
                    return tx;
                }
                this.setState({isAwaitingConfirmation: false});
                this.editor?.updateOptions({readOnly: false});
            } else if (signType === 'exchange') {
                this.setState({isAwaitingConfirmation: true});
                this.editor?.updateOptions({readOnly: true});
                try {
                    signedTx = await signViaExchange(tx, this.props.settingsStore!.defaultNode.url, proofIndex);
                } catch (e) {
                    console.error(e);
                    // this.props.notificationsStore!.notify(e, {type: 'error'});
                    this.setState({isAwaitingConfirmation: false});
                    this.editor?.updateOptions({readOnly: false});
                    return tx;
                }
                this.setState({isAwaitingConfirmation: false});
                this.editor?.updateOptions({readOnly: false});
            } else {
                signedTx = signTx(tx, {[proofIndex]: signType === 'seed' ? seed : accounts[selectedAccount].seed});
            }

            return signedTx;
        };

        let newEditorValue;
        if (Array.isArray(txOrTxs)) {
            let txs = [] as object[];
            const promises = txOrTxs.map(tx => signTxFromEditor(tx));
            Promise.all(promises).then(signedTxs => {
                signedTxs.forEach((tx, i) => {
                    if (tx.proofs && tx.proofs.length) {
                        txs = [...txs, tx];
                    } else {
                        txs = [...txs, txOrTxs[i]];
                    }
                });
                this.setState({signedTxs: txs});
                newEditorValue = `[${txs.map(tx => stringifyWithTabs(tx))}]`;
                this.setState({isAwaitingConfirmation: false});

                const model = this.editor?.getModel();
                if (model) {
                    model.setValue(newEditorValue);
                }
                const {availableProofs} = this.parseInput(newEditorValue);
                this.setState({editorValue: newEditorValue, proofIndex: availableProofs[0]});
            });
        } else {
            newEditorValue = await signTxFromEditor(txOrTxs).then(x => {
                if (x) {
                    return stringifyWithTabs(x);
                } else {
                    return libs.marshall.json.stringifyTx(txOrTxs);
                }
            });

            const model = this.editor.getModel();
            if (model) {
                model.setValue(newEditorValue);
            }
            const {availableProofs} = this.parseInput(newEditorValue);
            this.setState({editorValue: newEditorValue, proofIndex: availableProofs[0]});
        }
        return true;
    };


    handleSend = (txJson: string) => () => {
        const txOrTxs = libs.marshall.json.parseTx(txJson);
        const settingsStore = this.props.settingsStore!;
        const apiBase = settingsStore.defaultNode!.url;
        const nodeRequestOptions = settingsStore.nodeRequestOptions;

        const broadcastTx = (tx: any) => broadcast(tx, apiBase, nodeRequestOptions)
            .then(tx => {
                this.onClose();
                this.showMessage(<SuccessMessage id={tx.id}
                                                 node={this.props.settingsStore?.defaultNode}/>, {type: 'success'});

                // If setScript tx log event to tag manager
                if ([13, 15].includes(tx.type)) {
                    logToTagManager({
                        event: 'ideContractDeploy',
                        scriptType: tx.type === 13 ? 'account' : 'asset'
                    });
                }
            })
            .catch(e => {
                try {
                    const tx = libs.marshall.json.parseTx(txJson);
                    delete tx.proofs;
                    const newEditorValue = stringifyWithTabs(tx);
                    const model = this.editor!.getModel();
                    if (model) {
                        model.setValue(newEditorValue);
                    }

                    this.setState({
                        editorValue: newEditorValue,
                        proofIndex: 0
                    });

                    this.showMessage(
                        `Error occured.\n ERROR: ${JSON.stringify({...e, tx: undefined}, null, 4)}`,
                        {type: 'error'}
                    );
                } catch (e) {
                    this.showMessage('Error', {type: 'error'});
                }
            });

        if (Array.isArray(txOrTxs)) {
            this.setState({isMultipleSendDialogOpen: true});
        } else {
            broadcastTx(txOrTxs);
        }
    };

    updateStoreValue = debounce((newVal: string) => this.props.signerStore!.setTxJson(newVal), 1000);

    handleEditorChange = (editorValue: string, e?: monaco.editor.IModelContentChangedEvent) => {
        this.setState({editorValue});
        this.updateStoreValue(editorValue);
    };

    parseInput = (value: string) => {
        let result: { error?: string, availableProofs: number[] } = {
            availableProofs: []
        };
        try {
            const txObj = JSON.parse(value);
            const validateValue = (txOrTxs: any) => {
                const handleErrors = (tx: any) => {
                    const type = tx.type;
                    if (!type) {
                        if (validators.TTx(tx)) {
                            throw new Error(JSON.stringify(validators.TTx.errors));
                        }
                    }

                    const paramsValidator = schemaTypeMap[type] && schemaTypeMap[type].paramsValidator;
                    if (!paramsValidator) {
                        throw new Error(`Invalid TX type ${type}`);
                    }

                    if (!paramsValidator(tx)) {
                        throw new Error(JSON.stringify(paramsValidator.errors));
                    }

                    tx.proofs == null
                        ? result.availableProofs = range(0, 8)
                        : result.availableProofs = range(0, 8)
                            .filter((_, i) => !tx.proofs[i]);
                };
                if (Array.isArray(txOrTxs)) {
                    txOrTxs.forEach(tx => {
                        handleErrors(tx);
                    });
                } else {
                    const tx = txOrTxs;
                    handleErrors(tx);
                }
            };

            if (Array.isArray(txObj)) {
                validateValue(txObj[0]);
            } else {
                validateValue(txObj);
            }
        } catch (e) {
            // Todo: library should implement custom error field with array of validation errors
            result.error = e.message;
            try {
                result.error = JSON.parse(e.message)
                    .map((msg: string | { message: string, dataPath: string }) => typeof msg === 'string'
                        ? msg
                        : `${msg.dataPath} ${msg.message}`.trim()).join(', ');
            } catch (e) {
            }
        }

        return result;
    };

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        const modelUri = m.Uri.parse('schemas://transaction.json');
        this.model = m.editor.createModel(this.state.editorValue, 'json', modelUri);
        if (this.state.editorValue && !Array.isArray(JSON.parse(this.state.editorValue || ''))) {
            m.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [{
                    uri: schemas.TTx.$id, // id of the first schema
                    fileMatch: [modelUri.toString()], // associate with our model
                    schema: schemas.TTx
                }]
            });
        }
        if (this.state.editorValue && Array.isArray(JSON.parse(this.state.editorValue || ''))) {
            const txs = JSON.parse(this.state.editorValue || '');
            if (txs.every((tx: any) => tx.proofs && tx.proofs.length)) {
                this.setState({signedTxs: txs});
            }
        }
        e.setModel(this.model);
        this.props.settingsStore!.theme === 'dark'
            ? m.editor.setTheme(DARK_THEME_ID)
            : m.editor.setTheme(DEFAULT_THEME_ID);
    };

    componentWillUnmount() {
        this.model && this.model.dispose();
    }

    onClose = () => this.props.history.push('/');

    onCloseMultipleSendDialog = () => this.setState({isMultipleSendDialogOpen: !this.state.isMultipleSendDialogOpen});

    render() {
        const accounts = this.props.accountsStore!.accounts;
        const {
            editorValue,
            seed,
            proofIndex,
            selectedAccount,
            isAwaitingConfirmation,
            signType,
            isMultipleSendDialogOpen
        } = this.state;
        const {settingsStore} = this.props;
        const {availableProofs, error} = this.parseInput(editorValue);

        const signDisabled = !!error || (selectedAccount === -1 && !seed) || !availableProofs.includes(proofIndex)
            || (accounts.length === 0 && signType === 'account') || (seed === '' && signType === 'seed');


        let sendDisabled = true;
        try {
            const txOrTxs = JSON.parse(editorValue);
            if (Array.isArray(txOrTxs)) {
                sendDisabled = txOrTxs.map(tx => validators.TTx(tx)).some(x => !x);
            } else {
                sendDisabled = !validators.TTx(txOrTxs);
            }
        } catch (e) {
        }

        return (
            <>
                <Dialog
                    width={960}
                    height={800}
                    title="Sign and publish"
                    footer={<>
                        <Button className={styles.btn} onClick={this.onClose}>Cancel</Button>
                        <Button
                            className={styles.btn}
                            disabled={sendDisabled}
                            onClick={this.handleSend(editorValue)}
                            type="action-blue">
                            Publish
                        </Button>
                    </>}
                    onClose={this.onClose}
                    visible={true}
                    className={styles.root}

                >
                    <div className={styles.codeEditor}>
                        <MonacoEditor
                            height={307}
                            width={864}
                            onChange={this.handleEditorChange}
                            editorDidMount={this.editorDidMount}
                            options={{
                                readOnly: isAwaitingConfirmation,
                                scrollBeyondLastLine: false,
                                minimap: {enabled: false},
                                selectOnLineNumbers: true,
                                renderLineHighlight: 'none',
                                contextmenu: false,
                            }}
                            value={this.state.editorValue}
                        />
                    </div>
                    {editorValue
                        ? <div className={styles.errorMsg}>{error}</div>
                        : <div className={styles.errorMsg}>Paste your transaction here 👆</div>
                    }
                    <div className={styles.signing}>
                        <TransactionSigningForm
                            isAwaitingConfirmation={isAwaitingConfirmation}
                            disableAwaitingConfirmation={() => this.setState({isAwaitingConfirmation: false})}
                            signDisabled={signDisabled}
                            signType={signType}
                            onSignTypeChange={v => this.setState({signType: v as any})}
                            accounts={accounts}
                            selectedAccount={selectedAccount}
                            seed={seed}
                            availableProofIndexes={availableProofs}
                            proofIndex={proofIndex}
                            onSign={this.handleSign}
                            onAccountChange={v => this.setState({selectedAccount: +v})}
                            onProofNChange={v => this.setState({proofIndex: +v})}
                            onSeedChange={v => this.setState({seed: v})}
                        />
                    </div>
                </Dialog>
                <SendingMultipleTransactions transactions={this.state.signedTxs}
                                             visible={isMultipleSendDialogOpen}
                                             handleClose={this.onCloseMultipleSendDialog}
                                             networkOptions={{
                                                 nodeRequestOptions: settingsStore?.nodeRequestOptions,
                                                 defaultNode: settingsStore?.defaultNode!,
                                             }}/>
            </>
        );
    }
}


export default withRouter(TransactionSigning);


const stringifyWithTabs = (tx: any): string => {
    let result = JSON.stringify(tx, null, 2);
    // Find all unsafe longs and replace them in target json string
    const unsafeLongs = Object.values(tx)
        .filter((v) => typeof v === 'string' && parseInt(v) > Number.MAX_SAFE_INTEGER) as string[];
    unsafeLongs.forEach(unsafeLong => {
        result = result.replace(`"${unsafeLong}"`, unsafeLong);
    });
    return result;
};
