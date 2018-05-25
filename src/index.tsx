import 'script-loader!./fastopt.js'
import 'awesome-typescript-loader!./interop.ts'
import * as React from "react"
import { Provider, connect } from "react-redux"
import { render } from "react-dom"
import { Editor } from "./components/editor"
import { Toolbar, FlatButton, RaisedButton, Badge, ToolbarGroup, IconMenu, IconButton, MenuItem, FontIcon, Dialog, Tab, Tabs, DropDownMenu, Snackbar } from "material-ui"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import EnhancedButton from "material-ui/internal/EnhancedButton"
import AppBar from 'material-ui/AppBar'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import { store, editorCodeChange, loadSample, notifyUser, loadFromStorage } from './store'
import { IAppState, ICodingState } from './state'
import { copyToClipboard } from './utils/copyToClipboard'
import { createStore, Store } from "redux"

import { getMuiTheme } from 'material-ui/styles'
import { palette } from './style'
import { contextAware } from './utils/contextAware'
import { SyntaxTreeTab } from './components/syntaxTreeTab'
import { TopBar } from './components/topBar'
import { BinaryTab } from './components/binaryTab'
import { EditorTabs } from './components/editorTabs'



export class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props)
    this.state = store.getState()
    store.subscribe(() => {
      this.setState(store.getState())
    })
  }

  render() {
    return (
      <div>
        <TopBar />
        <div id="content" style={{ float: 'left', width: '70%' }}>
          <div style={{
            backgroundColor: palette.primary1Color, height: 48
          }}>
            <EditorTabs />
          </div>
          <Editor />
        </div >
        <div style={{ float: 'left', width: '30%' }}>
          <Tabs>
            <Tab label='Syntax tree'>
              <SyntaxTreeTab />
            </Tab>
            <Tab label='Binary'>
              <BinaryTab />
            </Tab>
          </Tabs>
          <Snackbar
            open={this.state.snackMessage.length > 0}
            message={this.state.snackMessage}
            autoHideDuration={4000}
            onRequestClose={() => {
              store.dispatch(notifyUser(''))
            }}
          />
        </div>
      </div >
    )
  }
}

const muiTheme = getMuiTheme({
  palette
})

const r = () =>
  render(
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById("container")
  )


setInterval(() => {
  localStorage.setItem('store', JSON.stringify(store.getState().coding))
}, 5000)

store.subscribe(() => {
  r()
})

r()


