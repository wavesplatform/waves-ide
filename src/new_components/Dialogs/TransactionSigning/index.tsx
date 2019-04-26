import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import debounce from 'debounce';
import { schemas, schemaTypeMap, validators } from '@waves/waves-transactions/dist/schemas';
import { range } from '@utils/range';
import { AccountsStore, SettingsStore, SignerStore } from '@stores';
import { broadcast, signTx } from '@waves/waves-transactions';
import { signViaKeeper } from '@utils/waveskeeper';

import MonacoEditor from 'react-monaco-editor';
import notification from 'rc-notification';
import Dialog from '@src/new_components/Dialog';
import Button from '@src/new_components/Button';
import TransactionSigningForm from './TransactionSigningForm';
import styles from './styles.less';
import { DEFAULT_THEME_ID } from '@src/setupMonaco';

type TNotification = { notice: (arg0: { content: string; }) => void };

interface IInjectedProps {
    signerStore?: SignerStore
    accountsStore?: AccountsStore
    settingsStore?: SettingsStore
}

interface ITransactionEditorProps extends IInjectedProps, RouteComponentProps {
}

interface ITransactionEditorState {
    editorValue: string
    proofIndex: number
    seed: string
    selectedAccount: number
    signType: 'account' | 'seed' | 'wavesKeeper'
    isAwaitingConfirmation: boolean
}

@inject('signerStore', 'settingsStore', 'accountsStore')
@observer
class TransactionSigning extends React.Component<ITransactionEditorProps, ITransactionEditorState> {
    private editor?: monaco.editor.ICodeEditor;
    private model?: monaco.editor.IModel;

    private showMessage = (data: string) => {
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: data});
        });
    };

    constructor(props: ITransactionEditorProps) {
        super(props);

        this.state = {
            selectedAccount: this.props.accountsStore!.activeAccountIndex,
            editorValue: this.props.signerStore!.txJson,
            proofIndex: 0,
            seed: '',
            signType: 'account',
            isAwaitingConfirmation: false,
        };
    }

    handleSign = async () => {
        if (!this.editor) return;
        const accounts = this.props.accountsStore!.accounts;
        const {proofIndex, selectedAccount, signType, seed} = this.state;
        const tx = JSON.parse(this.state.editorValue);

        let signedTx: any;
        //ToDo: try to remove 'this.editor.updateOptions' after react-monaco-editor update
        if (signType === 'wavesKeeper') {
            this.setState({isAwaitingConfirmation: true});
            this.editor.updateOptions({readOnly: true});
            try {
                signedTx = await signViaKeeper(tx, proofIndex);
            } catch (e) {
                console.error(e);
                this.setState({isAwaitingConfirmation: false});
                this.editor.updateOptions({readOnly: false});
                return;
            }
            this.setState({isAwaitingConfirmation: false});
            this.editor.updateOptions({readOnly: false});
        } else {
            signedTx = signTx(tx, {[proofIndex]: signType === 'seed' ? seed : accounts[selectedAccount].seed});
        }

        const editorValue = JSON.stringify(signedTx, null, 2);

        const model = this.editor.getModel();
        if (model) {
            model.setValue(editorValue);
        }
        const {availableProofs} = this.parseInput(editorValue);
        this.setState({editorValue, proofIndex: availableProofs[0]});
    };


    handleSend = (txJson: string) => () => {
        const tx = JSON.parse(txJson);
        const apiBase = this.props.settingsStore!.defaultNode!.url;

        broadcast(tx, apiBase)
            .then(tx => {
                this.onClose();
                this.showMessage('Tx has been sent');
            })
            .catch(e => {
                this.showMessage('Error occured');
            });
    };

    updateStoreValue = debounce((newVal: string) => this.props.signerStore!.setTxJson(newVal), 1000);

    handleEditorChange = (editorValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        this.setState({editorValue});
        this.updateStoreValue(editorValue);
    };

    parseInput = (value: string) => {
        let result: { error?: string, availableProofs: number[] } = {
            availableProofs: []
        };
        try {
            const txObj = JSON.parse(value);
            const type = txObj.type;
            if (!type) {
                if (validators.TTx(txObj)) {
                    throw new Error(JSON.stringify(validators.TTx.errors));
                }

            }
            const paramsValidator = schemaTypeMap[type] && schemaTypeMap[type].paramsValidator;
            if (!paramsValidator) {
                throw new Error(`Invalid TX type ${type}`);
            }

            if (!paramsValidator(txObj)) {
                throw new Error(JSON.stringify(paramsValidator.errors));
            }

            txObj.proofs == null
                ?
                result.availableProofs = range(0, 8)
                :
                result.availableProofs = range(0, 8)
                    .filter((_, i) => !txObj.proofs[i]);
        } catch (e) {
            // Todo: should probably add to the library custom error field with array of validation errors
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
        m.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: schemas.TTx.$id, // id of the first schema
                fileMatch: [modelUri.toString()], // associate with our model
                schema: schemas.TTx
            }]
        });
        m.editor.setTheme(DEFAULT_THEME_ID);
        e.setModel(this.model);
    };

    componentWillUnmount() {
        this.model && this.model.dispose();
    }

    onClose = () => this.props.history.push('/');

    render() {
        const accounts = this.props.accountsStore!.accounts;
        const {editorValue, seed, proofIndex, selectedAccount, isAwaitingConfirmation, signType} = this.state;
        const {availableProofs, error} = this.parseInput(editorValue);

        const signDisabled = !!error || (selectedAccount === -1 && !seed) || !availableProofs.includes(proofIndex);

        let sendDisabled = true;
        try {
            sendDisabled = !validators.TTx(JSON.parse(editorValue));
        } catch (e) {
        }

        return (
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
                    />
                </div>
                {editorValue
                    ? <div className={styles.errorMsg}>{error}</div>
                    : <div className={styles.errorMsg}>Paste your transaction above</div>
                }
                <div className={styles.signing}>

                    {isAwaitingConfirmation
                        ?
                        <WaitForWavesKeeper
                            onCancel={() => this.setState({isAwaitingConfirmation: false})}
                        />
                        :
                        <TransactionSigningForm
                            signDisabled={signDisabled}
                            signType={signType}
                            onSignTypeChange={e => this.setState({signType: e.target.value as any})}
                            accounts={accounts}
                            selectedAccount={selectedAccount}
                            seed={seed}
                            availableProofIndexes={availableProofs}
                            proofIndex={proofIndex}
                            onSign={this.handleSign}
                            onAccountChange={e => this.setState({selectedAccount: +e.target.value})}
                            onProofNChange={e => this.setState({proofIndex: +e.target.value})}
                            onSeedChange={e => this.setState({seed: e.target.value})}
                        />
                    }
                </div>


            </Dialog>
        );
    }
}


export default withRouter(TransactionSigning);

const WaitForWavesKeeper = ({onCancel}: { onCancel: () => void }) => <div className={styles.signing_WaitKeeperRoot}>
    <div className={styles.signing_WaitKeeperText}>
        <div className={styles.signing_title_blue}>Waiting for WavesKeeper confirmation</div>
        <div className={styles.signing_loading}>Loading...</div>
    </div>
    <Button className={styles.signing_WaitKeeperBtn} onClick={onCancel}>Cancel</Button>
</div>;

