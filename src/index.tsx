import * as React from "react";
import { render } from "react-dom";
import 'script-loader!./fastopt.js'

import { Editor } from "./components/editor";
import { Toolbar, FlatButton, RaisedButton, ToolbarGroup } from "material-ui";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EnhancedButton from "material-ui/internal/EnhancedButton";
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { store, editorCodeChange } from './store'
import { IAppState } from './state'

store.dispatch(editorCodeChange('new code'))

const ApplicationBar = () => (
  <AppBar
    title={<span>Waves IDE</span>}
    iconElementLeft={<div />}
    iconElementRight={<FlatButton label="Compile" />}
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
          <Editor store={store} code='' />
        </div>
      </MuiThemeProvider>
    );
  }
}

render(
  <App />,
  document.getElementById("container")
);

