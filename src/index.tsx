import * as React from "react"
import { Provider, connect } from "react-redux"
import { render } from "react-dom"
import { Editor } from "./components/editor"
import { Tab, Tabs } from "material-ui"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { store } from './store'
import { IAppState, ICodingState } from './state'

import { getMuiTheme } from 'material-ui/styles'
import { palette } from './style'
import { SyntaxTreeTab } from './components/syntaxTreeTab'
import { TopBar } from './components/topBar'
import { BinaryTab } from './components/binaryTab'
import { EditorTabs } from './components/editorTabs'
import { Intro } from './components/intro'
import { contextBinding } from "./utils/addContextToRepl"
import { compile } from "@waves/ride-js"
import { bufferToBase64 } from "./utils/bufferToBase64"
import { UserNotification } from './components/userNotification'
import { waves } from "./repl/waves";
import { UserDialog } from "./components/userDialog";
import { SettingsDialog } from "./components/settingsDialog";
import { Repl } from './repl/src/index'

export class app extends React.Component<{ coding: ICodingState }, IAppState> {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div id='body'>
        <TopBar />
        <div id="wrapper">
          <div id="inner-wrapper">
            <div id="content">
              <div id='tabs' style={{
                backgroundColor: palette.primary1Color, height: 48
              }}>
                <EditorTabs />
              </div>
              <div id='editor'>
                {this.props.coding.editors.length > 0 ? <Editor /> : <Intro />}
              </div>
            </div >
            <div id="inspector">
              <Tabs contentContainerStyle={{ flex: 1, overflowY: 'scroll' }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Tab label='Syntax tree'>
                  <SyntaxTreeTab />
                </Tab>
                <Tab label='Binary'>
                  <BinaryTab />
                </Tab>
              </Tabs>
              <UserNotification />
              <UserDialog />
              <SettingsDialog />
            </div>
          </div>
          <div style={{ height: '1px', backgroundColor: '#E5E7E9' }}></div>
          <div id='repl'>
            <Repl />
          </div>
        </div>
      </div >
    )
  }
}

const App = connect((state: IAppState) => ({
  coding: state.coding
}))(app)

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

store.subscribe(r)
r()

const state = store.getState()
const env = state.env
var loadRepl = false

if (!loadRepl) {
  const cpm = (code) => {
    const r = compile(code)
    if (r.error)
      return r.error
    return bufferToBase64(new Uint8Array(r.result))
  }

  const w = waves(env)

  const initialContext: any = {
    env,
    ...w,
    compile: cpm,
    publish: (code) =>
      w.broadcast(w.script(cpm(code)))
  }

  contextBinding.sync(initialContext)
}


