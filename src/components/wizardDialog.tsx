import * as React from "react"
import {Dialog, FlatButton} from "material-ui"
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
    text = 'test'

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
            title="test title"
            actions={actions}
            modal={true}
            open={this.props.open}
            onRequestClose={this.props.onClose}>
            {this.text}
        </Dialog>)
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

