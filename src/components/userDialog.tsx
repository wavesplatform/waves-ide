import * as React from "react"
import { Dialog, FlatButton } from "material-ui"
import { connect } from "react-redux"
import { IAppState } from 'state'

export class userDialog extends React.Component<{}> {
  static ref: userDialog
  private isOpen;
  private options: { label: string, text: React.ReactNode, buttons: Record<string, () => boolean> }

  constructor(props) {
    super(props)
    this.isOpen = false
    this.options = { label: '', text: '', buttons: {} }
    userDialog.ref = this
  }

  handleClose() {
    this.isOpen = false
    this.forceUpdate()
  }

  static open(label: string, text: React.ReactNode, buttons: Record<string, () => boolean>) {
    userDialog.ref.options = { label, text, buttons }
    userDialog.ref.isOpen = true
    userDialog.ref.forceUpdate()
  }

  render() {

    const actions = Object.keys(this.options.buttons).map(((b, i) => <FlatButton
      label={b}
      primary={i != 0}
      onClick={() => {
        const close = this.options.buttons[b]()
        if (close)
          this.handleClose()
      }}
    />))

    return (<Dialog
      title={this.options.label}
      actions={actions}
      modal={true}
      open={this.isOpen}
      onRequestClose={this.handleClose}>
      {this.options.text}
    </Dialog>)
  }
}

export const UserDialog = connect((state: IAppState) => ({}))(userDialog)

