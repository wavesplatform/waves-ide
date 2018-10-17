import * as React from "react"
import {RouteComponentProps} from 'react-router'
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
import {connect} from "react-redux"
import {userDialog} from "./userDialog";
import {newEditorTab} from '../actions'
import {multisig} from '../contractGenerators'
import Base58 from '../utils/base58'
import {Repl} from 'waves-repl'
import MonacoEditor from 'react-monaco-editor';
import {IAppState} from "../reducers";

const validateAddress = (address: string) => {
    try {
        const bytes = Base58.decode(address);
        return bytes.length === 32;
    } catch (e) {
        return false
    }
};

interface IWizardDialogProps {
    newEditorTab: (code: string) => void
    seed: string
}


interface IWizardState {
    publicKeys: string[]
    M: number, activeStep: number
    deployNetwork: string
    deploySecretType: "Private key" | "Seed",
    deploySecret: string
}
class WizardDialogComponent extends React.Component<RouteComponentProps & IWizardDialogProps, IWizardState> {

    constructor(props: RouteComponentProps & IWizardDialogProps) {
        super(props)
        this.state = {
            publicKeys: [''],
            M: 1,
            activeStep: 0,
            deployNetwork: "testnet",
            deploySecretType: "Seed",
            deploySecret: this.props.seed
        }
    }

    setM = (event) => {
        this.setState({M: event.target.value})
    };

    addPublicKey = () => {
        const {publicKeys} = this.state;
        if (publicKeys.length < 8) {
            publicKeys.push('');
        }
        this.setState({publicKeys})
    };

    updatePublicKey = (index) => (event) => {
        const {publicKeys} = this.state;
        publicKeys[index] = event.target.value;
        this.setState({publicKeys});
    };

    removePublicKey = (index) => () => {
        let {publicKeys, M} = this.state;
        publicKeys.splice(index, 1);
        if (publicKeys.length < M)
            M = publicKeys.length;
        this.setState({publicKeys, M})
    };

    generateContract = (): string => {
        const {publicKeys, M} = this.state;
        return multisig(publicKeys, M)
    }

    deployContract = (): void => {
        const {deployNetwork} = this.state
        const apiBase = {testnet: 'https://testnodes.wavesnodes.com', mainnet: 'https://nodes.wavesplatform.com'}[deployNetwork]
        const script = Repl.API.compile(this.generateContract());
        const secrets = [this.state.deploySecret];
        const tx = Repl.API.setScript({script}, secrets)
        Repl.API.broadcast(tx, apiBase)
            .then(tx => {
                this.handleClose()
                userDialog.open("Script has been set", <p>Transaction ID:&nbsp;
                    <b>{tx.id}</b></p>, {
                    "Close": () => {
                        return true
                    }
                })
            })
            .catch(e => {
                userDialog.open("Error occured", <p>Error:&nbsp;
                    <b>{e.toString()}</b></p>, {
                    "Close": () => {
                        return true
                    }
                })
            })
    }

    handleGenerate = () => {
        const {newEditorTab} = this.props;
        newEditorTab(this.generateContract());
        this.handleClose()
    };

    handleNext = () => {
        const {activeStep} = this.state;
        activeStep < 2 ?
            this.setState({activeStep: activeStep + 1})
            :
            this.deployContract()
    }

    handleBack = () => {
        this.setState({activeStep: this.state.activeStep - 1})
    }

    handleClose = () => {
        const {history} = this.props;
        history.push('/')
    };

    render() {
        const {publicKeys, M, activeStep, deployNetwork, deploySecret, deploySecretType} = this.state;

        let content;
        switch (activeStep) {
            case 0:
                content = <MultisigForm
                    publicKeys={publicKeys}
                    M={M}
                    addPublicKey={this.addPublicKey}
                    removePublicKey={this.removePublicKey}
                    updatePublicKey={this.updatePublicKey}
                    setM={this.setM}/>
                break;
            case 1:
                const contract = this.generateContract()
                content = [<MonacoEditor
                    value={contract}
                    height={300}
                    options={{
                        readOnly: true,
                        scrollBeyondLastLine: false,
                        codeLens: false,
                        minimap: {
                            enabled: false
                        }
                    }}
                />,
                    <Button
                        variant="raised"
                        children="edit"
                        color="primary"
                        onClick={this.handleGenerate}
                    />
                ]
                break;
            case 2:
                content = <div>
                    You have two options to deploy smart account script:
                    1. Copy base64 compiled contract and deploy it yourself via waves wallet, console or rest API
                    2. You can fill the form below and press deploy button
                    <TextField
                        label="Network"
                        name="Network"
                        select={true}
                        value={deployNetwork}
                        onChange={(e) => this.setState({deployNetwork: e.target.value})}
                        fullWidth={true}
                    >
                        <MenuItem key={"mainnet"} value={"mainnet"}>
                            Mainnet
                        </MenuItem>)
                        <MenuItem key={"testnet"} value={"testnet"}>
                            Testnet
                        </MenuItem>)
                    </TextField>
                    <TextField
                        label="Secret type"
                        name="Secret type"
                        select={true}
                        value={deploySecretType}
                        onChange={(e) => this.setState({deploySecretType: e.target.value as any})}
                        fullWidth={true}
                    >
                        {/*<MenuItem key={"Private key"} value={"Private key"}>*/}
                            {/*Private key*/}
                        {/*</MenuItem>)*/}
                        <MenuItem key={"Seed"} value={"Seed"}>
                            Seed
                        </MenuItem>)
                    </TextField>
                    <TextField
                        //error={!validateAddress(pk)}
                        //helperText={validateAddress(pk) ? '' : 'Invalid publicKey'}
                        required={true}
                        label={`${deploySecretType}`}
                        //name={`PK-${i}`}
                        value={deploySecret}
                        onChange={(e) => this.setState({deploySecret: e.target.value})}
                        fullWidth={true}
                    />
                </div>
                break
        }

        return (
            <Dialog
                open={true}
                maxWidth={activeStep === 1 ? "md" : "sm"}
                //onClose={this.handleClose}
                fullWidth={true}>
                <DialogTitle>
                    <Stepper activeStep={activeStep}>
                        <Step key={0}>
                            <StepLabel>Generate contract</StepLabel>
                        </Step>
                        <Step key={1}>
                            <StepLabel>Validate</StepLabel>
                        </Step>
                        <Step key={2}>
                            <StepLabel>Deploy</StepLabel>
                        </Step>
                    </Stepper>
                </DialogTitle>
                <DialogContent children={content}/>
                <DialogActions>
                    <Button
                        variant="text"
                        children="back"
                        color="primary"
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                    />
                    <Button
                        variant="text"
                        children={activeStep === 2 ? "deploy" : "next"}
                        color="primary"
                        disabled={(!publicKeys.every(validateAddress) && activeStep === 0) || (deploySecret === '' && activeStep === 2)}
                        onClick={this.handleNext}
                    />
                    <Button
                        variant="text"
                        children="close"
                        color="secondary"
                        onClick={this.handleClose}
                    />
                </DialogActions>
            </Dialog>
        )
    }
}

interface IMultisigFormProps {
    publicKeys: string[]
    M: number
    addPublicKey: () => void
    removePublicKey: (index: number) => () => void
    updatePublicKey: (index: number) => (e: React.ChangeEvent) => void
    setM: (e: React.ChangeEvent) => void
}

const MultisigForm = ({publicKeys, M, addPublicKey, removePublicKey, updatePublicKey, setM}: IMultisigFormProps) => (
    <div>
        <Grid container spacing={0}>
            <Grid item xs={8}>
                {publicKeys.map((pk, i, array) =>
                    <Grid container spacing={0} key={i}>
                        <Grid item xs={10}>
                            <TextField
                                error={!validateAddress(pk)}
                                helperText={validateAddress(pk) ? '' : 'Invalid publicKey'}
                                required={true}
                                label={`Public key ${i + 1}`}
                                name={`PK-${i}`}
                                value={pk}
                                onChange={updatePublicKey(i)}
                                fullWidth={true}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            {(i !== 0 || array.length > 1) &&
                            <IconButton onClick={removePublicKey(i)}>
                                <DeleteIcon/>
                            </IconButton>}
                        </Grid>
                    </Grid>
                )}
            </Grid>
            <Grid item xs={4}>
                <TextField
                    label="Required proofs"
                    name="M"
                    select={true}
                    value={M}
                    onChange={setM}
                    fullWidth={true}
                >
                    {Array.from({length: publicKeys.length},
                        (_, i) => <MenuItem key={i} value={i + 1}>
                            {(i + 1).toString()}
                        </MenuItem>)
                    }
                </TextField>
            </Grid>
        </Grid>
        {publicKeys.length < 8 &&
        <div style={{paddingTop: '5%'}}>
            <Button
                variant="contained"
                onClick={addPublicKey}
                color="primary">
                <Icon>add</Icon>
                Add public key
            </Button>
        </div>}
    </div>
)


const mapDispatchToProps = (dispatch => ({
    newEditorTab: code => dispatch(newEditorTab(code)),
}))
const mapStateToProps = (state: IAppState) => ({
    seed: state.env.SEED
})
export const WizardDialog = connect(mapStateToProps, mapDispatchToProps)(WizardDialogComponent)

