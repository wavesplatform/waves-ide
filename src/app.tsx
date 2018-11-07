import * as React from "react"
import {connect} from "react-redux"
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import {Editor} from "./components/editor"
import {store, getReplState} from './store'
import {ICodingState} from "./store/coding";
import {newEditorTab} from "./store/coding/actions";
import {TopBar} from './components/topBar'
import {EditorTabs} from './components/editorTabs'
import {Intro} from './components/intro'
import {UserNotification} from './components/userNotification'
import {UserDialog} from "./components/userDialog";
import {SettingsDialog} from "./components/settingsDialog";
import {WizardDialog} from "./components/wizardDialog";
import {RightTabs} from "./components/right-tabs"
import {Repl} from 'waves-repl'
import {RootState} from "./store";
import {TransactionSigningDialog} from "./components/TransactionSigningDialog";
import {TxGeneratorDialog} from "./components/TxGeneratorDialog";
// import '../web/layout.css'
// import '../web/style.css'

export class AppComponent extends React.Component<{ coding: ICodingState }> {

    private handleExternalCommand(e: any) {
        //if (e.origin !== 'ORIGIN' || !e.data || !e.data.command) return;
        const data = e.data
        switch (data.command) {
            case 'CREATE_NEW_CONTRACT':
                store.dispatch(newEditorTab({code: data.code, label: data.label}));
                e.source.postMessage({command: data.command, status: 'OK'}, e.origin);
                break;
        }
    }


    componentDidMount() {
        window.addEventListener("message", this.handleExternalCommand.bind(this))
        const state = store.getState();
        Repl.updateEnv(getReplState(state));

    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleExternalCommand.bind(this))
    }

    render() {
        const {coding} = this.props;

        return (
            <Router>
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
                                    {coding.editors.length > 0 ? <Editor/> : <Intro/>}
                                </div>
                            </div>
                            <div id="inspector">
                                <RightTabs/>
                                <UserNotification/>
                                <UserDialog/>
                            </div>
                        </div>
                        <div style={{height: '1px', backgroundColor: '#E5E7E9'}}></div>
                        <div id='repl'>
                            <Repl theme='light'/>
                        </div>
                    </div>
                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/wizard/multisig" component={WizardDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    <Route path="/txGenerator" component={TxGeneratorDialog}/>
                </div>
            </Router>
        )
    }
}

export const App = connect((state: RootState) => ({
    coding: state.coding
}))(AppComponent)



