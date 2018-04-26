import * as React from "react";
import { render } from "react-dom";
import 'script-loader!./fastopt.js'

import { Editor } from "./components/editor";
import { Toolbar, FlatButton, RaisedButton, ToolbarGroup, IconMenu, MenuItem, FontIcon, Dialog } from "material-ui";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EnhancedButton from "material-ui/internal/EnhancedButton";
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { store, editorCodeChange, closeDialog, openDialog } from './store'
import { IAppState } from './state'
import { encode } from 'bs58'

function copy(text) {
  var input = document.createElement('input');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input)
  return result;
}

const actions = [
  <FlatButton
    label="Copy and close"
    primary={true}
    keyboardFocused={true}
    onClick={() => {
      copy(compile(store.getState().editor.code).toString())
      store.dispatch(closeDialog())
    }}
  />,
];

const ApplicationBar = () => (
  <AppBar
    title={<span>Waves IDE</span>}
    iconElementLeft={
      <IconMenu
        iconButtonElement={
          <IconButton>
            <FontIcon className="muidocs-icon-navigation-expand-more" color='white' />
          </IconButton>
        }
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuItem primaryText="Simple" />
        <MenuItem primaryText="Multisig" />
      </IconMenu>
    }
    iconElementRight={
      <FlatButton label="Compile" onClick={() => store.dispatch(openDialog())} />
    }
  />
);

export class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props);
    this.state = store.getState()
    store.subscribe(() => {
      this.setState(store.getState())
    })
  }

  render() {
    return (
      <MuiThemeProvider>
        <ApplicationBar />
        <div id="content">
          <Editor state={store.getState().editor} store={store} />
          <Dialog
            title="Dialog With Actions"
            actions={actions}
            modal={false}
            open={this.state.isDialogOpen}>
            {this.state.isDialogOpen ? compile(store.getState().editor.code).toString() : ''}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

const r = () =>
  render(
    <App />,
    document.getElementById("container")
  )


store.subscribe(() => {
  r()
})

r()


