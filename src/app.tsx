import * as React from "react"
import {connect} from "react-redux"
import {Editor} from "./components/editor"
import {store} from './store'
import {newEditorTab} from "./actions";
import {IAppState, ICodingState} from './state'
import {TopBar} from './components/topBar'
import {EditorTabs} from './components/editorTabs'
import {Intro} from './components/intro'
import {UserNotification} from './components/userNotification'
import {UserDialog} from "./components/userDialog";
import {SettingsDialog} from "./components/settingsDialog";
import {WizardDialog} from "./components/wizardDialog";
import {RightTabs} from "./components/right-tabs"
import {Repl} from 'waves-repl'

export class AppComponent extends React.Component<{ coding: ICodingState }, IAppState> {
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
        const state = store.getState();
        Repl.updateEnv({...state.env, ...state.coding});

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
                            <RightTabs/>
                            <UserNotification/>
                            <UserDialog/>
                            <SettingsDialog/>
                            <WizardDialog/>
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

export const App = connect((state: IAppState) => ({
    coding: state.coding
}))(AppComponent)



