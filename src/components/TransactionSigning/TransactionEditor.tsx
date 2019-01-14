import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from "@material-ui/core/Typography/Typography";
import {connect, Dispatch} from "react-redux"
import MonacoEditor from "react-monaco-editor";
import * as monaco from 'monaco-editor';
import ReactResizeDetector from "react-resize-detector";
import debounce from "debounce";
import {userDialog} from "../UserDialog";
import {userNotification} from "../../store/notifications/actions";
import {RootState} from "../../store";
import {signTx, broadcast} from '@waves/waves-transactions';
import {validators, schemas, schemaTypeMap} from '@waves/waves-transactions/dist/schemas'
import {signViaKeeper} from "../../utils/waveskeeper";
import {networkCodeFromAddress} from "../../utils/networkCodeFromAddress";
import {networks} from "../../constants";
import TransactionSigningForm from "./TransactionSigningForm";
import {range} from "../../utils/range";
import {txChanged} from "../../store/txEditor/actions";
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
    root: {
        width: '100%',
        height: 'calc(100% - 96px)'
    },
    area: {
        minHeight: '167px',
        borderWidth: '1px 0px 1px 0px',
        borderStyle: 'solid',
        borderColor: '#b0b0b0b0',
        marginTop: '20px',
        padding: '10px 0px 10px 0px'
    },
    content: {
        overflowY: 'unset',
        //height: 500, // need arbitrary fixed height to make editor container take all remaining height in chrome. Don't know why
        flex: 1, // flex also works
        justifyContent: 'space-between',
        flexDirection: 'column',
        display: 'flex',
    },
    footer: {
        height: '37px'
    }
});

const mapStateToProps = (state: RootState) => ({
    apiBase: state.settings.apiBase,
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
    StyledComponentProps<keyof ReturnType<typeof styles>>,
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

    constructor(props: ITransactionEditorProps) {
        super(props);


        this.state = {
            selectedAccount: this.props.selectedAccount,
            editorValue: props.txJson || '',
            proofIndex: 0,
            seed: '',
            signType: 'account',
            isAwaitingConfirmation: false,
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
        //ToDo: try to remove 'this.editor.updateOptions' after react-monaco-editor update
        if (signType === 'wavesKeeper') {
            this.setState({isAwaitingConfirmation: true});
            this.editor.updateOptions({readOnly: true});
            try {
                signedTx = await signViaKeeper(tx, proofIndex)
            } catch (e) {
                console.error(e)
                this.setState({isAwaitingConfirmation: false});
                this.editor.updateOptions({readOnly: false});
                return
            }
            this.setState({isAwaitingConfirmation: false});
            this.editor.updateOptions({readOnly: false});
        } else {
            signedTx = signTx(tx, {[proofIndex]: signType === 'seed' ? seed : accounts[selectedAccount].seed});
        }

        const editorValue = JSON.stringify(signedTx, null, 2);

        const model =  this.editor.getModel();
        if(model){
            model.setValue(editorValue)
        }
        this.setState({editorValue});
    };


    handleSend = (txJson: string) => () => {
        const tx = JSON.parse(txJson);
        const apiBase = this.props.apiBase;

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
            const type = txObj.type;
            if (!type){
                if (validators.TTx(txObj)){
                    throw new Error(JSON.stringify(validators.TTx.errors))
                }

            }
            const paramsValidator = schemaTypeMap[type] && schemaTypeMap[type].paramsValidator
            if (!paramsValidator){
                throw new Error(`Invalid TX type ${type}`)
            }

            if(!paramsValidator(txObj)){
                throw new Error(JSON.stringify(paramsValidator.errors))
            }

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
        const modelUri = monaco.Uri.parse("schemas://transaction.json");
        this.model = monaco.editor.createModel(this.state.editorValue, 'json', modelUri);
        m.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: schemas.TTx.$id, // id of the first schema
                fileMatch: [modelUri.toString()], // associate with our model
                schema: schemas.TTx
            }]
        });
        e.setModel(this.model);
    };

    componentWillUnmount() {
        this.model && this.model.dispose()
    }

    render() {
        const {accounts, classes} = this.props;
        const {editorValue, seed, proofIndex, selectedAccount, isAwaitingConfirmation, signType} = this.state;
        const {availableProofs, error} = this.parseInput(editorValue);

        const signDisabled = !!error || (selectedAccount === -1 && !seed) || !availableProofs.includes(proofIndex);

        let sendDisabled = true;
        try {
            sendDisabled = !validators.TTx(JSON.parse(editorValue));
        } catch (e) {
        }

        return (
            <Dialog classes={{paper: classes!.root}} open fullWidth maxWidth="md">
                <DialogTitle children="Transaction JSON. Sign and publish"/>
                <DialogContent className={classes!.content}>
                    {editorValue
                        ?
                        <Typography style={{color: 'red'}}>{error}</Typography>
                        :
                        <Typography>Paste your transaction here:</Typography>
                    }
                    <ReactResizeDetector handleHeight handleWidth refreshMode='throttle'>
                        {(width: number, height: number) => (
                            <MonacoEditor
                                //height={height}
                                width={width}
                                onChange={this.handleEditorChange}
                                editorDidMount={this.editorDidMount}
                                options={{
                                    readOnly: isAwaitingConfirmation,
                                    scrollBeyondLastLine: false,
                                    codeLens: false,
                                    minimap: {
                                        enabled: false
                                    }
                                }}
                            />
                        )}
                    </ReactResizeDetector>

                    <div className={classes!.area}>
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
                    </div>
                </DialogContent>
                <DialogActions className={classes!.footer}>
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


export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionEditorComponent)))

const WaitForWavesKeeper = ({onCancel}: { onCancel: () => void }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 147
    }}>
        <Typography variant='subtitle1'>Waiting for WavesKeeper confirmation</Typography>
        <CircularProgress style={{margin:'0 30px 0 10px'}} size={30} thickness={5} color='secondary' variant="indeterminate" />
        <Button
            variant="text"
            children="cancel"
            color="secondary"
            onClick={onCancel}
        />
    </div>);

