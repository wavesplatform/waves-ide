import * as React from "react"
import {Dialog, FlatButton, List, ListItem, TextField, RaisedButton, FontIcon, IconButton} from "material-ui"
import Delete from 'material-ui/svg-icons/action/delete'
//import {Delete, Add} from 'material-ui/svg-icons/'
import {connect} from "react-redux"
import {IAppState} from 'reducers'
import {closeWizard, newEditorTab} from '../actions'
import {multisig} from '../contractGenerators'

interface IWizardDialogProps {
    open: boolean
    kind: string
    onClose: () => void
    newEditorTab: (code: string) => void
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
        const actions = Object.keys(buttons).map(((b, i) => <FlatButton
            label={b}
            primary={i != 0}
            onClick={() => {
                const close = buttons[b]();
                if (close)
                    this.props.onClose()
            }}
        />))


        return <Dialog
            title="Multisignature contract"
            actions={actions}
            contentStyle={ {
                position: "absolute",
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            } }
            modal={true}
            style={{paddingTop: 0}}
            repositionOnUpdate={true}
            autoScrollBodyContent={true}
            open={this.props.open}
            onRequestClose={this.props.onClose}
            children={
                <MultisigForm ref={this.multisigForm}/>
            }
        />

    }
}

class MultisigForm extends React.Component<any, { publicKeys: string[], M: number }> {
    constructor(props) {
        super(props);
        this.state = {
            publicKeys: [],
            M: 0
        }
    }

    getParams() {
        return this.state
    }

    validateBase58(base58: string) {
        return true
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
        const {publicKeys} = this.state;
        publicKeys.splice(index, 1);
        this.setState({publicKeys})
    }

    render() {
        const {publicKeys, M} = this.state;

        return <div>
            {publicKeys.map((pk, i) =>
                <div key={i}>
                    <span>{`Public key ${i + 1}: `}</span>
                    <TextField
                        name={`PK-${i}`}
                        value={pk}
                        onChange={this.updatePublicKey(i)}
                        //placeholder={`Public key ${i + 1}`}
                        fullWidth={false}
                        style={{width: '50%'}}
                    />
                    <IconButton onClick={this.removePublicKey(i)}>
                        <Delete/>
                    </IconButton>
                </div>
            )}
            {this.state.publicKeys.length < 8 &&
            <div>
                <RaisedButton
                    label="Add public key"
                    onClick={this.addPublicKey}
                    secondary={true}
                    icon={<FontIcon className="material-icons">add</FontIcon>}
                />
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

