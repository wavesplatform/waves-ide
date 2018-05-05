import 'script-loader!./fastopt.js'
import * as React from "react";
import { Provider } from "react-redux";
import { render } from "react-dom";
import { Editor } from "./components/editor";
import { CompilationDialog } from "./components/compilationDialog";
import { Toolbar, FlatButton, RaisedButton, ToolbarGroup, IconMenu, MenuItem, FontIcon, Dialog, Tab, Tabs, DropDownMenu, Snackbar } from "material-ui";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EnhancedButton from "material-ui/internal/EnhancedButton";
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { store, editorCodeChange, loadSample } from './store'
import { IAppState } from './state'
import { copyToClipboard } from './utils/copyToClipboard'
import JSONTree from 'react-json-tree'
import { createStore, Store } from "redux";
import * as Base58 from "./base58";
import * as blake from './blake2b';
import { keccak256 } from './sha3';
import { getMuiTheme } from 'material-ui/styles';
import { palette } from './style';

window['base58Encode'] = (bytes: number[]): string => {
  return Base58.encode(bytes)
}
window['base58Decode'] = (data: string): number[] => {
  return Array.from(Base58.decode(data))
}
window['keccak256'] = (bytes: number[]): number[] => {
  return keccak(bytes)
}
window['blake2b256'] = (bytes: number[]): number[] => {
  return Array.from(blake2b(bytes))
}

function blake2b(input: number[]) {
  return blake.blake2b(Uint8Array.from(input), null, 32);
}

function keccak(input) {
  return (keccak256 as any).array(input);
}

const contextAware = (component: React.StatelessComponent | React.ComponentClass) => {
  const store: React.Validator<Number> = (): Error => null
  component.contextTypes = { store }
}

const ApplicationBar: React.SFC = () => (
  <AppBar
    title={<span>Waves IDE</span>}
    iconElementLeft={<div />}
    iconElementRight={
      <DropDownMenu value='Samples'>
        <MenuItem value={1} primaryText="Simple" onClick={() => store.dispatch(loadSample('simple'))} />
        <MenuItem value={2} primaryText="Multisig (2 of 3)" onClick={() => store.dispatch(loadSample('multisig'))} />
        <MenuItem value={3} primaryText="Notary" onClick={() => store.dispatch(loadSample('notary'))} />
      </DropDownMenu>
    }
  />
)
contextAware(ApplicationBar)

const SyntaxTreeTab: React.SFC = (props, context: { store: Store<IAppState> }) => {
  const { editor } = context.store.getState()

  const theme = {
    base00: '#FFFFFF', //background
    base01: '#383830',
    base02: '#49483e',
    base03: '#FFFFFF', //ITEM_STRING_EXPANDED_COLOR 75715e
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: palette.primary1Color, //TEXT_COLOR
    base08: '#f92672', //NULL_COLOR, UNDEFINED_COLOR, FUNCTION_COLOR, SYMBOL_COLOR
    base09: '#fd971f', //NUMBER_COLOR, BOOLEAN_COLOR
    base0A: '#f4bf75',
    base0B: '#75715e', //STRING_COLOR, DATE_COLOR, ITEM_STRING_COLOR
    base0C: '#a1efe4',
    base0D: palette.primary1Color, //ARROW_COLOR, LABEL_COLOR
    base0E: '#ae81ff',
    base0F: '#cc6633'
  }

  const regexp = new RegExp('\"', 'g')
  const ast = !editor.compilationResult || editor.compilationResult.error ? { type: 'NON_COMPILABLE' } : editor.compilationResult.ast

  return <JSONTree
    data={ast}
    theme={theme}
    invertTheme={false}
    getItemString={(type, data: any, itemType, itemString) => <span>{data.type ? data.type : data.name}</span>}
    labelRenderer={l => <span>{l[0]}</span>}
    valueRenderer={v => <span>{v.toString().replace(regexp, '')}</span>}
  />
}
contextAware(SyntaxTreeTab)

const BinaryTab: React.SFC<{ onCopy: () => void }> = ({ onCopy }, context: { store: Store<IAppState> }) => {
  const { editor } = store.getState()

  if (!editor.compilationResult || editor.compilationResult.error) {
    return <div style={{ margin: '10px' }}><span>
      Here will be your script base58 binary.
      Write some code or use samples from above.
    </span>
    </div>
  }

  const value = !editor.compilationResult || editor.compilationResult.error ? 'none' : editor.compilationResult.result
  const elipsis = (s: string, max: number): string => {
    let trimmed = s.slice(0, max)
    if (trimmed.length < s.length)
      trimmed += '...'
    return trimmed
  }
  let snack = false
  return <div style={{ marginTop: '10px' }}>
    <span style={{ margin: '15px' }}>Script base58:</span>
    <span style={{ margin: '15px' }} className='binary-span'>{elipsis(value, 700)}</span>
    <FlatButton label="Copy to clipboard" onClick={() => {
      if (copyToClipboard(value)) {
        onCopy()
      }
    }} />
  </div>
}
contextAware(BinaryTab)

export class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props);
    this.state = store.getState()
    store.subscribe(() => {
      this.setState(store.getState())
    })
  }

  snack = false

  render() {
    return (
      <div>
        <ApplicationBar />
        <div id="content" style={{ float: 'left', width: '70%' }}>
          <Tabs>
            <Tab label='Editor'>
              <Editor />
            </Tab>
          </Tabs>
        </div>
        <div style={{ float: 'left', width: '30%' }}>
          <Tabs>
            <Tab label='Syntax tree'>
              <SyntaxTreeTab />
            </Tab>
            <Tab label='Binary'>
              <BinaryTab onCopy={() => {
                this.snack = true
                this.forceUpdate()
              }} />
            </Tab>
          </Tabs>
          <Snackbar
            open={this.snack}
            message="Copied to clipboard!"
            autoHideDuration={4000}
            onRequestClose={() => {
              this.snack = false
              this.forceUpdate()
            }}
          />
        </div>
      </div>
    );
  }
}

const muiTheme = getMuiTheme({
  palette
});

const r = () =>
  render(
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <App />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById("container")
  )

store.subscribe(() => {
  r()
})

r()
