import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Grid from "@material-ui/core/Grid"
import MenuItem from "@material-ui/core/MenuItem"
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import {connect, Dispatch} from "react-redux"
import {userDialog} from "./userDialog";
import {newEditorTab} from '../store/coding/actions'
import {userNotification} from "../store/notifications/actions";
import {multisig} from '../contractGenerators'
import Base58 from '../utils/base58'
import {Repl} from 'waves-repl'
import MonacoEditor from 'react-monaco-editor';
import {RootState} from "../store";
import {copyToClipboard} from "../utils/copyToClipboard";
import Typography from "@material-ui/core/Typography/Typography";
import {signTx} from "waves-transactions";
import {networkCodeFromAddress} from "../utils/networkCodeFromAddress";
import {networks} from "../constants";


interface ITransactionSignerProps {
    txJson: string,
    sign: () => any
    onCopy: () => void
}

interface ITransactionSignerState {
    editorValue: string
    proofIndex: number
    seed: string
    signedTxJson?: string
}


class TransactionSigningDialogComponent extends React.Component<RouteComponentProps & ITransactionSignerProps, ITransactionSignerState> {

    constructor(props: ITransactionSignerProps & RouteComponentProps) {
        super(props);
        this.state = {
            editorValue: props.txJson || '',
            proofIndex: 0,
            seed: '',
            signedTxJson: undefined
        }
    }

    handleClose = () => {
        const {history} = this.props;
        history.push('/')
    };

    handleSign = (seed: string, proofIndex: number) => () => {
        const tx = JSON.parse(this.state.editorValue);
        const signedTx = signTx({[proofIndex]: seed}, tx);
        this.setState({signedTxJson: JSON.stringify(signedTx, null, 2)});
    };

    handleBack = () => this.setState({signedTxJson: undefined});

    handleDeploy = (txJson: string) => () => {
        const tx = JSON.parse(txJson);
        let networkCode: string;
        if (tx.recipient) {
            networkCode = networkCodeFromAddress(tx.recipient)
        } else {
            networkCode = tx.chainId
        }
        const apiBase = networkCode === 'W' ? networks.mainnet.apiBase : networks.testnet.apiBase
        Repl.API.broadcast(tx, apiBase)
            .then(tx => {
                this.handleClose()
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

    parseInput = (value: string) => {
        let result: { txType?: number, error?: string, availableProofs: number[] } = {
            availableProofs: []
        };
        try {
            const txObj = JSON.parse(value);
            result.txType = txObj.type
            // Todo: Use validation instead of signing
            // This code serves as json validation
            signTx('example', {...txObj})
            result.availableProofs = Array.from({length: 8})
                .map((_, i) => !!txObj.proofs[i] ? -1 : i)
                .filter(x => x !== -1)
        } catch (e) {
            result.error = e.message
        }

        return result
    };

    render() {
        const {editorValue, signedTxJson, seed, proofIndex} = this.state;

        const {txType, availableProofs, error} = this.parseInput(editorValue)

        return (
            <Dialog open fullWidth maxWidth="md">
                <DialogTitle>
                    {signedTxJson === undefined ?
                        <Typography>Paste your transaction here:</Typography>
                        :
                        <Typography>Your signed transaction:</Typography>
                    }
                </DialogTitle>
                <DialogContent>
                    {error && <Typography style={{color: 'red'}}>{error}</Typography>}
                    {signedTxJson === undefined ?
                        <TransactionSigning
                            editorValue={editorValue}
                            seed={seed}
                            availableProofIndexes={availableProofs}
                            proofIndex={proofIndex}
                            txType={txType}
                            onProofNChange={(e) => this.setState({proofIndex: +e.target.value})}
                            onCodeChange={(editorValue, editor) => this.setState({editorValue})}
                            onSeedChange={(e) => this.setState({seed: e.target.value!})}
                        />
                        :
                        <TransactionSigned signedTxJson={signedTxJson}/>
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
                        variant="text"
                        children="back"
                        color="primary"
                        disabled={signedTxJson === undefined}
                        onClick={this.handleBack}
                    />
                    {signedTxJson === undefined ?
                        <Button
                            variant="contained"
                            children="sign"
                            color="primary"
                            disabled={signedTxJson === undefined &&
                            (!!error || !seed || !availableProofs.includes(proofIndex))}
                            onClick={this.handleSign(seed, proofIndex)}
                        />
                        :
                        <Button
                            variant="contained"
                            children="deploy"
                            color="primary"
                            onClick={this.handleDeploy(signedTxJson)}
                        />
                    }
                </DialogActions>
            </Dialog>
        )
    }
}

interface ITransactionSigningProps {
    editorValue: string
    seed: string
    availableProofIndexes: number[]
    proofIndex: number
    txType?: number
    onProofNChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onCodeChange: (val: string, e: monaco.editor.IModelContentChangedEvent) => void
    onSeedChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void

}

const TransactionSigning = (
    {
        editorValue, seed, txType, onCodeChange, onSeedChange, availableProofIndexes,
        proofIndex, onProofNChange
    }: ITransactionSigningProps) => (
    <div>
        <MonacoEditor
            value={editorValue}
            language='json'
            height={300}
            onChange={onCodeChange}
            options={{
                readOnly: false,
                scrollBeyondLastLine: false,
                codeLens: false,
                minimap: {
                    enabled: false
                }
            }}
        />
        <TextField
            error={availableProofIndexes.length > 0 && !availableProofIndexes.includes(proofIndex)}
            label="Proof Index"
            name="N"
            select
            required
            value={proofIndex}
            onChange={onProofNChange}
            fullWidth
            disabled={availableProofIndexes.length === 0}
        >
            {availableProofIndexes.map((n => <MenuItem key={n} value={n}>{(n + 1).toString()}</MenuItem>))
            }
        </TextField>
        <TextField
            error={seed === ''}
            helperText={seed !== '' ? '' : 'Empty seed phrase'}
            required
            label={`Seed to sign`}
            //name={`PK-${i}`}
            value={seed}
            onChange={onSeedChange}
            fullWidth
            style={{marginTop: 12, marginBottom: 12}}
        />
    </div>
);

const TransactionSigned = ({signedTxJson}: { signedTxJson: string }) => (
    <div>
        <MonacoEditor
            value={signedTxJson}
            language='json'
            height={300}
            options={{
                readOnly: true,
                scrollBeyondLastLine: false,
                codeLens: false,
                minimap: {
                    enabled: false
                }
            }}
        />
    </div>
);

const mapStateToProps = (state: RootState) => ({
    txJson: state.txGeneration.txJson
});

const mapDispatchToProps = ((dispatch: Dispatch<RootState>) => ({
    onCopy: () => {
        dispatch(userNotification("Copied!"))
    }
}));

export const TransactionSigningDialog = connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionSigningDialogComponent))

