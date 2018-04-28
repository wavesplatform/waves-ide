import * as React from 'react'
import { IEditorState } from '../state'
import { FlatButton, RaisedButton, IconMenu, Dialog } from 'material-ui'
import { copyToClipboard } from '../utils/copyToClipboard'
import { store } from '../store'

export class CompilationDialog extends React.Component<{ title: string, content: string, label: string, buttonLabel: string }, {}> {
  state = {
    open: false,
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  render() {
    const actions = [
      <FlatButton
        label={this.props.buttonLabel}
        primary={true}
        onClick={this.handleClose}
      />,
    ]

    return (
      <FlatButton style={{ color: 'white', marginTop: '10px' }} label={this.props.label} onClick={() => this.setState({ open: true })}>
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {this.props.content}
        </Dialog>
      </FlatButton>
    )
  }
}

//{compile(store.getState().editor.code).toString()}
