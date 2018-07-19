//import 'script-loader!./fastopt.js'
//import 'awesome-typescript-loader!./interop.ts'
import * as React from "react"
import { Provider } from "react-redux"
import { render } from "react-dom"
import { Editor } from "./components/editor"
import { Tab, Tabs, Snackbar } from "material-ui"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { store, notifyUser } from './store'
import { IAppState } from './state'

import { getMuiTheme } from 'material-ui/styles'
import { palette } from './style'
import { SyntaxTreeTab } from './components/syntaxTreeTab'
import { TopBar } from './components/topBar'
import { BinaryTab } from './components/binaryTab'
import { EditorTabs } from './components/editorTabs'
import { Intro } from './components/intro'
import { config } from "./config"
import { Repl } from "./components/repl";

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
          {this.state.coding.editors.length > 0 ? <Editor /> : <Intro />}
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
        <div style={{ height: `${config.replHeight}px`, backgroundColor: 'red', clear: 'both' }}>
          <Repl />
        </div>
      </div>
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


