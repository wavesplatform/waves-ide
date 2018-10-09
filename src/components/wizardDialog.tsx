import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    IconButton,
    Button,
    TextField,
    Grid,
    MenuItem,
    Icon
} from "@material-ui/core";
import {Delete} from '@material-ui/icons/index';
import {connect} from "react-redux"
import {IAppState} from 'reducers'
import {closeWizard, newEditorTab} from '../actions'
import {multisig} from '../contractGenerators'
import Base58 from '../utils/base58'

interface IWizardDialogProps {
    open: boolean
    kind: string
    onClose: () => void
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
            'close': () => this.props.onClose()
        }
        const actions = Object.keys(buttons).map(((b, i) => <Button
            variant="text"
            children={b}
            color={i != 0 ? "primary" : "secondary"}
            onClick={() => {
                const close = buttons[b]();
                if (close)
                    this.props.onClose()
            }}
        />))


        return <Dialog
            open={this.props.open}
            onClose={this.props.onClose}>
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


    }

    //        <Dialog
    //             title="Multisignature contract"
    //             contentStyle={{
    //                 position: "absolute",
    //                 left: '50%',
    //                 top: '50%',
    //                 transform: 'translate(-50%, -50%)'
    //             }}
    //             modal={true}
    //             style={{paddingTop: 0}}
    //             repositionOnUpdate={true}
    //             autoScrollBodyContent={true}
    //             open={this.props.open}
    //             onRequestClose={this.props.onClose}
    //             children={
    //                 <MultisigForm ref={this.multisigForm}/>
    //             }
    //         ></Dialog>
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
        console.log(event)
        //this.setState({M: value})
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
        const {publicKeys, M} = this.state;

        return <div>
            <Grid container spacing={0}>
                <Grid item xs={8}>
                    {publicKeys.map((pk, i, array) =>
                        <Grid container spacing={0} key={i}>
                            <Grid item xs={10}>
                                <TextField
                                    error={!validateAddress(pk)}
                                    required={true}
                                    label={`Public key ${i + 1}`}
                                    name={`PK-${i}`}
                                    value={pk}
                                    onChange={this.updatePublicKey(i)}
                                    fullWidth={true}
                                    //style={{width: '75%'}}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                {(i !== 0 || array.length > 1) &&
                                <IconButton onClick={this.removePublicKey(i)}>
                                    <Delete/>
                                </IconButton>}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Required proofs"
                        value={this.state.M}
                        onChange={this.setM}
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
                    onClick={this.addPublicKey}
                    color="secondary">
                    <Icon>send</Icon>
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
    onClose: () => dispatch(closeWizard()),
    newEditorTab: code => dispatch(newEditorTab(code))
}))
export const WizardDialog = connect(mapStateToProps, mapDispatchToProps)(WizardDialogComponent)

