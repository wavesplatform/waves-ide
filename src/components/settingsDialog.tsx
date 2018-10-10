import * as React from "react"
import { Dialog, FlatButton, TextField } from "material-ui"
import { connect } from "react-redux"
import { IAppState, IEnvironmentState } from '../state'
import { settingsChange } from "../actions";

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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 2 }}>
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
        <i style={{ paddingTop: '27px' }} className="material-icons">info</i>
        <p style={{ padding: '15px', flex: 1 }}>
          Here you can set environment variables like your <b>SEED</b> and <b>chainId </b>
          that other crypto dependant functions will use as default.
          Every parameter is available through <b>env</b> object.
          <br /><br />
          You can also change this via console at the bottom.<br /><br />
          <i style={{ fontSize: '12px' }}>env.SEED = 'my new hack proof seed'</i>
        </p>
      </div>
    </Dialog >)
  }
}



export const SettingsDialog = connect((state: IAppState) => ({ env: state.env }),
  (dispatch) => ({
    handleChange: (field, value) => {
      dispatch(settingsChange(field, value))
    }
  }))(settingsDialog)

