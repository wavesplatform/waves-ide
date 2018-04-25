import * as React from "react";
import { render } from "react-dom";
import 'script-loader!./fastopt.js'

import { Editor } from "./components/editor";
import { Toolbar, FlatButton, RaisedButton, ToolbarGroup } from "material-ui";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EnhancedButton from "material-ui/internal/EnhancedButton";

export class App extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
  }

  code: string

  handleClick() {
    alert(this.code)
  }

  render() {
    return (
      <MuiThemeProvider>
        <div style={{ float: 'left', width: '100vw', backgroundColor: 'red' }}>
          <Toolbar>
            <ToolbarGroup>
              <RaisedButton label="Compile" primary={true} onClick={this.handleClick.bind(this)} />
            </ToolbarGroup>
          </Toolbar>
        </div>
        <div style={{ clear: 'both' }}>
          <Editor onChange={(code => {
            this.code = code
          }).bind(this)} />
        </div>
      </MuiThemeProvider>
    );
  }
}

render(
  <App />,
  document.getElementById("container")
);

