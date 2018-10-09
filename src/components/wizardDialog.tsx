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

interface IWizardDialogProps {
    open: boolean
    kind: string
    closeWizard: () => void
    newEditorTab: (code: string) => void
}

const validateAddress = (address: string) => {
    try {
        const bytes = Base58.decode(address)
        return bytes.length === 32;
    } catch (e) {
        return false
    }
}

class WizardDialogComponent extends React.Component<IWizardDialogProps> {
    static ref: WizardDialogComponent;
    private multisigForm = React.createRef<MultisigForm>();

    constructor(props: IWizardDialogProps) {
        super(props)
        WizardDialogComponent.ref = this
    }

    generateContract(): string {
        if (!this.multisigForm) return;
        const params = this.multisigForm.current.getParams();
        return multisig(params.publicKeys, params.M)
    }


    render() {
        const buttons = {
            'generate': () => this.props.newEditorTab(this.generateContract()),
            'close': () => this.props.closeWizard()
        }
        const actions = Object.keys(buttons).map(((b, i) => <Button
            key={i}
            variant="text"
            children={b}
            color={i != 0 ? "primary" : "secondary"}
            onClick={() => {
                const close = buttons[b]();
                if (close)
                    this.props.closeWizard()
            }}
        />))


        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.closeWizard}
                fullWidth={true}>
                <DialogTitle>
                    Multisignature contract
                </DialogTitle>
                <DialogContent>
                    <MultisigForm ref={this.multisigForm}/>
                </DialogContent>
                <DialogActions>
                    {actions}
                </DialogActions>
            </Dialog>
        )
    }
}

class MultisigForm extends React.Component<any, { publicKeys: string[], M: number }> {
    constructor(props) {
        super(props);
        this.state = {
            publicKeys: [''],
            M: 1
        }
    }

    getParams() {
        return this.state
    }


    setM = (event) => {
        this.setState({M: event.target.value})
    }

    addPublicKey = () => {
        const currentPublicKeys = this.state.publicKeys;
        if (currentPublicKeys.length < 8) {
            currentPublicKeys.push('');
        }
        this.setState({
            publicKeys: currentPublicKeys
        })
    }

    updatePublicKey = (index) => (event) => {
        const currentPublicKeys = this.state.publicKeys;
        currentPublicKeys[index] = event.target.value;
        this.setState({
            publicKeys: currentPublicKeys
        });
    }

    removePublicKey = (index) => (event) => {
        let {publicKeys, M} = this.state;
        publicKeys.splice(index, 1);
        if (publicKeys.length < M)
            M = publicKeys.length;
        this.setState({publicKeys, M})
    }

    render() {
        const {publicKeys} = this.state;

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
                                    onChange={this.updatePublicKey(i)}
                                    fullWidth={true}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                {(i !== 0 || array.length > 1) &&
                                <IconButton onClick={this.removePublicKey(i)}>
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
                        value={this.state.M}
                        onChange={this.setM}
                        fullWidth={true}
                    >
                        {Array.from({length: this.state.publicKeys.length},
                            (_, i) => <MenuItem key={i} value={i + 1}>
                                {(i + 1).toString()}
                            </MenuItem>)
                        }
                    </TextField>
                </Grid>
            </Grid>
            {this.state.publicKeys.length < 8 &&
            <div style={{paddingTop: '5%'}}>
                <Button
                    variant="contained"
                    onClick={this.addPublicKey}
                    color="primary">
                    <Icon>add</Icon>
                    Add public key
                </Button>
            </div>}
        </div>
    }
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

