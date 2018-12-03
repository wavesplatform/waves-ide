import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {connect, Dispatch} from "react-redux"
import Typography from "@material-ui/core/Typography/Typography";
import MonacoEditor from "react-monaco-editor";
import debounce from "debounce";
import {userDialog} from "../userDialog";
import {userNotification} from "../../store/notifications/actions";
import {RootState} from "../../store";
import {signTx, broadcast} from '/Users/siem/IdeaProjects/waves-transactions/dist';
import {TTx} from '/Users/siem/IdeaProjects/waves-transactions/dist/transactions';
import {validators} from '/Users/siem/IdeaProjects/waves-transactions/dist/schemas'
import {signViaKeeper} from "../../utils/waveskeeper";
import {networkCodeFromAddress} from "../../utils/networkCodeFromAddress";
import {networks} from "../../constants";
import TransactionSigningForm from "./TransactionSigningForm";
import TxSchemas from '/Users/siem/IdeaProjects/waves-transactions/dist/schemas/manifest'
import {range} from "../../utils/range";
import {txChanged} from "../../store/txEditor/actions";


const mapStateToProps = (state: RootState) => ({
    txJson: state.txEditor.txJson,
    accounts: state.accounts.accounts,
    selectedAccount: state.accounts.selectedAccount
});

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => ({
    onCopy: () => {
        dispatch(userNotification("Copied!"))
    },
    onEditorValueChange: debounce((value: string) => dispatch(txChanged(value)), 1000)
});

interface ITransactionEditorProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {

}

interface ITransactionEditorState {
    editorValue: string
    proofIndex: number
    seed: string
    selectedAccount: number
    signType: 'account' | 'seed' | 'wavesKeeper'
    isAwaitingConfirmation: boolean
}

class TransactionEditorComponent extends React.Component<ITransactionEditorProps, ITransactionEditorState> {
    private editor?: monaco.editor.ICodeEditor;
    private model?: monaco.editor.IModel;

    private keeperEnabled: boolean;

    constructor(props: ITransactionEditorProps) {
        super(props);
        this.keeperEnabled = typeof window.Waves === 'object';

        this.state = {
            selectedAccount: this.props.selectedAccount,
            editorValue: props.txJson || '',
            proofIndex: 0,
            seed: '',
            signType: 'account',
            isAwaitingConfirmation: false
        }
    }

    handleClose = () => {
        const {history} = this.props;
        history.push('/')
    };

    handleSign = async () => {
        if (!this.editor) return;
        const {accounts} = this.props;
        const {proofIndex, selectedAccount, signType, seed} = this.state;
        const tx = JSON.parse(this.state.editorValue);

        let signedTx: any;
        if (signType === 'wavesKeeper') {
            this.setState({isAwaitingConfirmation: true});
            this.editor.updateOptions({readOnly:true});
            try {
                signedTx = await signViaKeeper(tx, proofIndex)   
            }catch (e) {}
            this.setState({isAwaitingConfirmation: false});
            this.editor.updateOptions({readOnly:false});
        } else {
            signedTx = signTx(tx, {[proofIndex]: signType === 'seed' ? seed : accounts[selectedAccount].seed});
        }

        const editorValue = JSON.stringify(signedTx, null, 2);

        this.editor.getModel().setValue(editorValue);
        this.setState({editorValue});
    };


    handleSend = (txJson: string) => () => {
        const tx = JSON.parse(txJson);
        let networkCode: string;
        if (tx.recipient) {
            networkCode = networkCodeFromAddress(tx.recipient)
        } else {
            networkCode = tx.chainId
        }
        const apiBase = networkCode === 'W' ? networks.mainnet.apiBase : networks.testnet.apiBase;
        broadcast(tx, apiBase)
            .then(tx => {
                this.handleClose();
                userDialog.open("Tx has been sent", <p>Transaction ID:&nbsp;
                    <b>{tx.id}</b></p>, {
                    "Close": () => {
                        return true
                    }
                })
            })
            .catch(e => {
                userDialog.open("Error occured", <p>Error:&nbsp;
                    <b>{e.message}</b></p>, {
                    "Close": () => {
                        return true
                    }
                })
            })
    };

    handleEditorChange = (editorValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        this.setState({editorValue});
        this.props.onEditorValueChange(editorValue)
    };

    parseInput = (value: string) => {
        let result: { error?: string, availableProofs: number[] } = {
            availableProofs: []
        };
        try {
            const txObj = JSON.parse(value);
            // Todo: Should add txParams json schema to library and use it instead
            // This code serves as json validation
            signTx({...txObj}, 'example');
            txObj.proofs == null
                ?
                result.availableProofs = range(0, 8)
                :
                result.availableProofs = range(0, 8)
                    .filter((_, i) => !txObj.proofs[i])
        } catch (e) {
            // Todo: should probably add to the library custom error field with array of validation errors
            result.error = e.message;
            try {
                result.error = JSON.parse(e.message)
                    .map((msg: string | { message: string, dataPath: string }) => typeof msg === 'string' ?
                        msg
                        :
                        `${msg.dataPath} ${msg.message}`.trim()).join(', ')
            } catch (e) {
            }
        }

        return result
    };

    editorDidMount = (e: monaco.editor.ICodeEditor, m: typeof monaco) => {
        this.editor = e;
        const modelUri = monaco.Uri.parse("transaction.json");
        this.model = monaco.editor.createModel(this.state.editorValue, 'json', modelUri);
        m.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: TxSchemas.TTx.$id, // id of the first schema
                fileMatch: [modelUri.toString()], // associate with our model
                schema: TxSchemas.TTx
            }]
        });
        e.setModel(this.model);
    };

    componentWillUnmount() {
        this.model && this.model.dispose()
    }

    render() {
        const {accounts} = this.props;
        const {editorValue, seed, proofIndex, selectedAccount, isAwaitingConfirmation, signType} = this.state;
        const {availableProofs, error} = this.parseInput(editorValue);

        const signDisabled = !!error || (selectedAccount === -1 && !seed) || !availableProofs.includes(proofIndex);

        let sendDisabled = true;
        try {
            sendDisabled = !validators.TTx(JSON.parse(editorValue));
        } catch (e) {
        }

        return (
            <Dialog open fullWidth maxWidth="md">
                <DialogTitle children="Transaction JSON. Sign and publish"/>
                <DialogContent style={{overflowY: 'unset'}}>
                    {editorValue
                        ?
                        <Typography style={{color: 'red'}}>{error}</Typography>
                        :
                        <Typography>Paste your transaction here:</Typography>
                    }
                    <MonacoEditor
                        height={300}
                        onChange={this.handleEditorChange}
                        editorDidMount={this.editorDidMount}
                        options={{
                            readOnly: false,
                            scrollBeyondLastLine: false,
                            codeLens: false,
                            minimap: {
                                enabled: false
                            }
                        }}
                    />
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
                            onSeedChange={(e) => this.setState({seed: e.target.value!})}
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        children="close"
                        color="secondary"
                        onClick={this.handleClose}
                    />
                    <Button
                        variant="contained"
                        children="send"
                        color="primary"
                        disabled={sendDisabled}
                        onClick={this.handleSend(editorValue)}
                    />
                    }
                </DialogActions>
            </Dialog>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionEditorComponent))

const WaitForWavesKeeper = ({onCancel}: { onCancel: () => void }) => (<div>
    <div>Waiting for confirmation</div>
    <Button
        variant="text"
        children="cancel"
        color="secondary"
        onClick={onCancel}
    />
</div>);