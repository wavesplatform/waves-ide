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
import {newEditorTab, notifyUser} from '../actions'
import {multisig} from '../contractGenerators'
import Base58 from '../utils/base58'
import {Repl} from 'waves-repl'
import MonacoEditor from 'react-monaco-editor';
import {IAppState} from "../reducers";
import {copyToClipboard} from "../utils/copyToClipboard";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

const networks = {
    testnet: {apiBase: 'https://testnodes.wavesnodes.com', chainId: 'T'},
    mainnet: {apiBase: 'https://nodes.wavesplatform.com', chainId: 'W'}
}

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
    onCopy: () => void
    seed: string
}


interface IWizardState {
    publicKeys: string[]
    M: number,
    activeStep: number
    deployNetwork: string
    deploySecretType: "Private key" | "Seed phrase",
    deploySecret: string
}

class WizardDialogComponent extends React.Component<RouteComponentProps & IWizardDialogProps, IWizardState> {

    public state: IWizardState = {
        publicKeys: [''],
        M: 1,
        activeStep: 0,
        deployNetwork: "testnet",
        deploySecretType: "Seed phrase",
        deploySecret: ''
    };

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
        const {apiBase, chainId} = networks[deployNetwork]
        const script = Repl.API.compile(this.generateContract());
        const secrets = [this.state.deploySecret];
        const tx = Repl.API.setScript({script, chainId}, secrets)
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
                    <b>{e.message}</b></p>, {
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
                content = <div>
                    <MonacoEditor
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
                    />
                    <div>
                        <Typography>
                            If you do not want to enter seed or private key on next step for some reason, you
                            can copy
                            base64 compiled contract and deploy it by yourself via <a
                            href="https://client.wavesplatform.com" target="_blank">Waves wallet</a>,&nbsp;
                             <a href="https://demo.wavesplatform.com/example/console"
                               target="_blank">console</a>&nbsp;
                            or&nbsp;<a href="https://nodes.wavesplatform.com" target="_blank">REST API</a>
                        </Typography>
                        <Button
                            variant="contained"
                            children="edit"
                            color="primary"
                            onClick={this.handleGenerate}
                        />
                        <Button
                            variant="outlined"
                            children="Copy base64"
                            size="medium"
                            color="primary"
                            onClick={() => {
                                const compiled = Repl.API.compile(this.generateContract());
                                if (copyToClipboard(compiled)) {
                                    this.props.onCopy()
                                }
                            }}/>
                    </div>
                </div>
                break;
            case 2:
                content = <div>
                    <Typography>
                        <div>
                            <div>
                                <Typography>
                                    You can fill the form below and press deploy button to make multisignature
                                    account immediately
                                </Typography>
                                <TextField
                                    label="Network"
                                    name="Network"
                                    select={true}
                                    value={deployNetwork}
                                    onChange={(e) => this.setState({deployNetwork: e.target.value})}
                                    fullWidth={true}
                                    style={{marginTop: 12, marginBottom: 12}}
                                >
                                    <MenuItem key={"mainnet"} value={"mainnet"}>
                                        MAINNET
                                    </MenuItem>)
                                    <MenuItem key={"testnet"} value={"testnet"}>
                                        TESTNET
                                    </MenuItem>)
                                </TextField>
                                <TextField
                                    label="Secret type"
                                    name="Secret type"
                                    select={true}
                                    value={deploySecretType}
                                    onChange={(e) => this.setState({deploySecretType: e.target.value as any})}
                                    fullWidth={true}
                                    style={{marginTop: 12, marginBottom: 12}}
                                >
                                    <MenuItem key={"Seed phrase"} value={"Seed phrase"} selected={true}>
                                        Seed phrase
                                    </MenuItem>
                                    <MenuItem key={"Private key"} value={"Private key"} disabled={true}>
                                        Private key (soon)
                                    </MenuItem>))
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
                                    style={{marginTop: 12, marginBottom: 12}}
                                />
                                <Typography>
                                    Address:<b>{deploySecret ? Repl.API.address(deploySecret, networks[deployNetwork].chainId) : ''}</b>
                                </Typography>
                            </div>
                            {/*<br/>*/}
                            {/*<ExpansionPanel>*/}
                                {/*<ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>*/}
                                    {/*<Typography><strong>Copy compiled contract</strong></Typography>*/}
                                {/*</ExpansionPanelSummary>*/}
                                {/*<ExpansionPanelDetails>*/}
                                    {/*<div>*/}
                                        {/*<Typography>*/}
                                            {/*If you do not want to enter seed or private key here for some reason, you*/}
                                            {/*can copy*/}
                                            {/*base64 compiled contract and deploy it by yourself via <a*/}
                                            {/*href="https://client.wavesplatform.com" target="_blank">Waves wallet</a>,*/}
                                            {/*<a href="https://demo.wavesplatform.com/example/console"*/}
                                               {/*target="_blank">console</a>*/}
                                            {/*or <a href="https://nodes.wavesplatform.com" target="_blank">REST API</a>*/}
                                        {/*</Typography>*/}
                                        {/*<Grid*/}
                                            {/*container*/}
                                            {/*alignItems="center"*/}
                                            {/*justify="center"*/}
                                            {/*direction="column">*/}
                                            {/*<Button*/}
                                                {/*variant="outlined"*/}
                                                {/*children="Copy base64"*/}
                                                {/*size="medium"*/}
                                                {/*color="primary"*/}
                                                {/*onClick={() => {*/}
                                                    {/*const compiled = Repl.API.compile(this.generateContract());*/}
                                                    {/*if (copyToClipboard(compiled)) {*/}
                                                        {/*this.props.onCopy()*/}
                                                    {/*}*/}
                                                {/*}}/>*/}
                                        {/*</Grid>*/}
                                    {/*</div>*/}
                                {/*</ExpansionPanelDetails>*/}
                            {/*</ExpansionPanel>*/}
                        </div>
                    </Typography>
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
                            <StepLabel>Set public keys</StepLabel>
                        </Step>
                        <Step key={1}>
                            <StepLabel>Review</StepLabel>
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
                        children="close"
                        color="secondary"
                        onClick={this.handleClose}
                    />
                    <Button
                        variant="text"
                        children="back"
                        color="primary"
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                    />
                    <Button
                        variant={activeStep === 2 ? "contained" : "text"}
                        children={activeStep === 2 ? "deploy" : "next"}
                        color="primary"
                        disabled={(!publicKeys.every(validateAddress) && activeStep === 0) || (deploySecret === '' && activeStep === 2)}
                        onClick={this.handleNext}
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
    onCopy: () => {
        dispatch(notifyUser("Copied!"))
    }
}))
const mapStateToProps = (state: IAppState) => ({
    seed: state.env.SEED
})
export const WizardDialog = connect(mapStateToProps, mapDispatchToProps)(WizardDialogComponent)

