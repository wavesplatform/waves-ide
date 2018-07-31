import * as React from "react"
import { Dialog, FlatButton, TextField } from "material-ui"
import { connect } from "react-redux"
import { IAppState, IEnvironmentState } from '../state'
import { changeEnvField } from "../store";

export class settingsDialog extends React.Component<{ env: IEnvironmentState, handleChange: (field, value) => void }> {
  static ref: settingsDialog
  private isOpen;

  constructor(props) {
    super(props)
    this.isOpen = false
    settingsDialog.ref = this
  }

  handleClose() {
    this.isOpen = false
    this.forceUpdate()
  }

  static open() {
    settingsDialog.ref.isOpen = true
    settingsDialog.ref.forceUpdate()
  }

  render() {

    const buttons = { 'ok': () => { this.handleClose() } }
    const actions = Object.keys(buttons).map(((b, i) => <FlatButton
      label={b}
      primary={true}
      onClick={() => {
        const close = buttons[b]()
        if (close)
          this.handleClose()
      }}
    />))

    return (<Dialog
      title='Settings'
      actions={actions}
      modal={true}
      open={this.isOpen}
      onRequestClose={this.handleClose}>
      <div>
        <TextField
          floatingLabelText="env.SEED"
          value={this.props.env.SEED}
          floatingLabelFixed={true}
          rows={2}
          fullWidth={true}
          multiLine={true}
          onChange={(e) => {
            this.props.handleChange('SEED', (e.nativeEvent.target as any).value)
          }}
        /><br />
        <TextField
          floatingLabelText="env.API_BASE"
          value={this.props.env.API_BASE}
          floatingLabelFixed={true}
          fullWidth={true}
          onChange={(e) => {
            this.props.handleChange('API_BASE', (e.nativeEvent.target as any).value)
          }}
        /><br />
        <TextField
          floatingLabelText="env.CHAIN_ID"
          value={this.props.env.CHAIN_ID}
          floatingLabelFixed={true}
          onChange={(e) => {
            this.props.handleChange('CHAIN_ID', (e.nativeEvent.target as any).value)
          }}
        />
      </div>
    </Dialog>)
  }
}

export const SettingsDialog = connect((state: IAppState) => ({ env: state.env }),
  (dispatch) => ({
    handleChange: (field, value) => {
      dispatch(changeEnvField(field, value))
    }
  }))(settingsDialog)

