import * as React from "react";
import { render } from "react-dom";
//import 'script-loader!./fastopt.js'

import { Editor } from "./components/editor";
import { Toolbar, FlatButton, RaisedButton, ToolbarGroup, IconMenu, MenuItem, FontIcon } from "material-ui";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EnhancedButton from "material-ui/internal/EnhancedButton";
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { store, editorCodeChange } from './store'
import { IAppState } from './state'

const compileButtonHandler = () => {
  alert(compile(store.getState().editor.code))
}
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
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="Simple" />
        <MenuItem primaryText="Multisig" />
      </IconMenu>
    }
    iconElementRight={
      <FlatButton label="Compile" onClick={compileButtonHandler} />
    }
  />
);

export class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props);
    store.subscribe(() => {
      this.setState(store.getState())
    })
  }

  render() {
    return (
      <MuiThemeProvider>
        <div style={{ float: 'left', width: '100vw', backgroundColor: 'red' }}>
          <ApplicationBar />
        </div>
        <div style={{ clear: 'both' }}>
          <Editor state={store.getState().editor} store={store} />
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


