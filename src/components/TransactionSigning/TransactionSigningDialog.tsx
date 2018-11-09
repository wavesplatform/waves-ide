import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {connect, Dispatch} from "react-redux"
import {userDialog} from "../userDialog";
import {userNotification} from "../../store/notifications/actions";
import {Repl} from 'waves-repl'
import {RootState} from "../../store";
import Typography from "@material-ui/core/Typography/Typography";
import {signTx} from "waves-transactions";
import {networkCodeFromAddress} from "../../utils/networkCodeFromAddress";
import {networks} from "../../constants";
import TransactionSigningForm from "./TransactionSigningForm";

const mapStateToProps = (state: RootState) => ({
    txJson: state.txGeneration.txJson,
    accounts: state.accounts.accounts,
    selectedAccount: state.accounts.selectedAccount
});

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => ({
    onCopy: () => {
        dispatch(userNotification("Copied!"))
    }
});

interface ITransactionSignerProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {

}

interface ITransactionSignerState {
    editorValue: string
    proofIndex: number
    seed: string
    selectedAccount: number
}

class TransactionSigningDialogComponent extends React.Component<ITransactionSignerProps, ITransactionSignerState> {

    constructor(props: ITransactionSignerProps) {
        super(props);
        this.state = {
            selectedAccount: this.props.selectedAccount,
            editorValue: props.txJson || '',
            proofIndex: 0,
            seed: '',
        }
    }

    handleClose = () => {
        const {history} = this.props;
        history.push('/')
    };

    handleSign = (seed: string, proofIndex: number) => () => {
        const tx = JSON.parse(this.state.editorValue);
        const signedTx = signTx({[proofIndex]: seed}, tx);
        this.setState({editorValue: JSON.stringify(signedTx, null, 2)});
    };


    handleSend = (txJson: string) => () => {
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
        const {accounts} = this.props;
        const {editorValue, seed, proofIndex, selectedAccount} = this.state;
        const {txType, availableProofs, error} = this.parseInput(editorValue);

        const seedToSign = selectedAccount === -1
            ? seed
            : accounts[selectedAccount].seed;


        return (
            <Dialog open fullWidth maxWidth="md">
                <DialogTitle children="Transaction JSON. Sign and publish"/>
                <DialogContent>
                    <TransactionSigningForm
                        error={error}
                        accounts={accounts}
                        selectedAccount={selectedAccount}
                        editorValue={editorValue}
                        seed={seed}
                        availableProofIndexes={availableProofs}
                        proofIndex={proofIndex}
                        txType={txType}
                        onSign={this.handleSign(seedToSign, proofIndex)}
                        onAccountChange={e => this.setState({selectedAccount: +e.target.value})}
                        onProofNChange={(e) => this.setState({proofIndex: +e.target.value})}
                        onCodeChange={(editorValue, editor) => this.setState({editorValue})}
                        onSeedChange={(e) => this.setState({seed: e.target.value!})}
                    />
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
                        disabled={!!error}
                        onClick={this.handleSend(editorValue)}
                    />
                    }
                </DialogActions>
            </Dialog>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionSigningDialogComponent))

