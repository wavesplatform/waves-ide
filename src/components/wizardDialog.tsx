import * as React from "react"
import {Dialog, FlatButton, List, ListItem, TextField} from "material-ui"
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
    static ref: WizardDialogComponent
    private publicKeys = ['a', 'b']

    constructor(props: IWizardDialogProps) {
        super(props)
        WizardDialogComponent.ref = this
    }

    generateContract(): string {
        return multisig(['a', 'b', 'c'], 2)
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
                const close = buttons[b]()
                if (close)
                    this.props.onClose()
            }}
        />))

        return (<Dialog
            title="Multisig contract"
            actions={actions}
            modal={true}
            open={this.props.open}
            onRequestClose={this.props.onClose}>
            <MultisigForm/>
        </Dialog>)
    }
}

class MultisigForm extends React.Component<any, {publicKeys: string[], M: number}> {
    constructor(props){
        super(props);
        this.state = {
            publicKeys: [],
            M: 0
        }
    }
    validateBase58(base58:string){
        return true
    }

    render() {
        const {publicKeys, M} = this.state;

        return <React.Fragment>
            {publicKeys.map((pk,i) =>
                <TextField key={i}
                           name={`PK-${i}`}
                />
            )}
        </React.Fragment>
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

