import * as React from "react"
import {Provider, connect} from "react-redux"
import {render} from "react-dom"
import {Editor} from "./components/editor"
import {Tab, Tabs} from "material-ui"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {store} from './store'
import {newEditorTab} from "./actions";
import {IAppState, ICodingState} from './state'
import {getMuiTheme} from 'material-ui/styles'
import {palette} from './style'
import {SyntaxTreeTab} from './components/syntaxTreeTab'
import {TopBar} from './components/topBar'
import {BinaryTab} from './components/binaryTab'
import {EditorTabs} from './components/editorTabs'
import {Intro} from './components/intro'
import {UserNotification} from './components/userNotification'
import {UserDialog} from "./components/userDialog";
import {SettingsDialog} from "./components/settingsDialog";
import {Repl} from 'waves-repl'
import {saveState} from "./utils/localStore";
import debounce = require('debounce')

export class app extends React.Component<{ coding: ICodingState }, IAppState> {
    constructor(props) {
        super(props)
    }

    private handleExternalCommand(e) {
        //if (e.origin !== 'ORIGIN' || !e.data || !e.data.command) return;
        const data = e.data
        switch (data.command) {
            case 'CREATE_NEW_CONTRACT':
                store.dispatch(newEditorTab(data.code, data.label));
                e.source.postMessage({command: data.command, status: 'OK'}, e.origin);
                break;
        }
    }


    componentDidMount() {
        window.addEventListener("message", this.handleExternalCommand.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleExternalCommand.bind(this))
    }

    render() {
        return (
            <div id='body'>
                <TopBar/>
                <div id="wrapper">
                    <div id="inner-wrapper">
                        <div id="content">
                            <div id='tabs' style={{
                                backgroundColor: '#f8f9fb', height: 45
                            }}>
                                <EditorTabs/>
                            </div>
                            <div id='editor'>
                                {this.props.coding.editors.length > 0 ? <Editor/> : <Intro/>}
                            </div>
                        </div>
                        <div id="inspector">
                            <Tabs contentContainerStyle={{flex: 1, overflowY: 'scroll'}}
                                  inkBarStyle={{backgroundColor: '#1f5af6'}}
                                  style={{
                                      height: '100%',
                                      backgroundColor: '#f8f9fb',
                                      display: 'flex',
                                      flexDirection: 'column'
                                  }}>
                                <Tab label='Syntax tree'
                                     style={{backgroundColor: '#f8f9fb', color: '#4e5c6e', textTransform: 'none'}}>
                                    <SyntaxTreeTab/>
                                </Tab>
                                <Tab label='Binary'
                                     style={{backgroundColor: '#f8f9fb', color: '#4e5c6e', textTransform: 'none'}}>
                                    <BinaryTab/>
                                </Tab>
                            </Tabs>
                            <UserNotification/>
                            <UserDialog/>
                            <SettingsDialog/>
                        </div>
                    </div>
                    <div style={{height: '1px', backgroundColor: '#E5E7E9'}}></div>
                    <div id='repl'>
                        <Repl theme='light'/>
                    </div>
                </div>
            </div>
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
                <App/>
            </MuiThemeProvider>
        </Provider>,
        document.getElementById("container"),
        () => {
            const state = store.getState();
            Repl.updateEnv({...state.env, ...state.coding});
        }
    )

store.subscribe(debounce(() => {
    saveState(store.getState())
}, 2000))

r()


