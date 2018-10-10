import * as React from "react"
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
import {connect} from "react-redux"
import {IAppState} from 'reducers'
import {closeWizard, newEditorTab} from '../actions'
import {multisig} from '../contractGenerators'
import Base58 from '../utils/base58'

const validateAddress = (address: string) => {
    try {
        const bytes = Base58.decode(address)
        return bytes.length === 32;
    } catch (e) {
        return false
    }
};

interface IWizardDialogProps {
    open: boolean
    kind: string
    closeWizard: () => void
    newEditorTab: (code: string) => void
}


class WizardDialogComponent extends React.Component<IWizardDialogProps, {publicKeys: string[],M: number}> {
    static ref: WizardDialogComponent;

    constructor(props: IWizardDialogProps) {
        super(props)
        this.state ={
            publicKeys: [''],
            M: 1
        }
        WizardDialogComponent.ref = this
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

    generateContract(): string {
        const {publicKeys, M} = this.state
        return multisig(publicKeys, M)
    }

    handleGenerate = () => {
        const {closeWizard, newEditorTab} = this.props;
        newEditorTab(this.generateContract());
        closeWizard();
    };

    handleClose = () => {
        const {closeWizard} = this.props;
        closeWizard()
    };

    render() {
        const {open} = this.props
        const {publicKeys, M} = this.state

        return (
            <Dialog
                open={open}
                onClose={this.handleClose}
                fullWidth={true}>
                <DialogTitle>
                    Multisignature contract
                </DialogTitle>
                <DialogContent>
                    <MultisigForm
                        publicKeys={publicKeys}
                        M={M}
                        addPublicKey={this.addPublicKey}
                        removePublicKey={this.removePublicKey}
                        updatePublicKey={this.updatePublicKey}
                        setM={this.setM}/>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        children="generate"
                        color="secondary"
                        disabled={!publicKeys.every(validateAddress)}
                        onClick={this.handleGenerate}
                    />
                    <Button
                        variant="text"
                        children="close"
                        color="primary"
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
const  MultisigForm = ({publicKeys, M, addPublicKey, removePublicKey, updatePublicKey, setM}: IMultisigFormProps) => {
        return <div>
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
    }

const mapStateToProps = ((state: IAppState) => ({
    open: state.wizard.open,
    kind: state.wizard.kind
}));

const mapDispatchToProps = (dispatch => ({
    closeWizard: () => dispatch(closeWizard()),
    newEditorTab: code => dispatch(newEditorTab(code))
}))
export const WizardDialog = connect(mapStateToProps, mapDispatchToProps)(WizardDialogComponent)

