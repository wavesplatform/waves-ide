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
import {TransactionSigningDialog} from "./components/TransactionSigning";
import {TxGeneratorDialog} from "./components/TxGeneratorDialog";
import {StyledComponentProps, Theme, withStyles} from "@material-ui/core";
import {IAccount} from "./store/accounts";

const styles = (theme: Theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    filler: {
        backgroundColor: "rgb(248, 249, 251)",
        width: '1%'
    },
    wrapper: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
    },
    innerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        flex: 2
    },
    content: {
        height: '100%',
        width: '74%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
    }
});

const mapStateToProps = (state: RootState) => ({
    coding: state.coding
})

interface IAppProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    ReturnType<typeof mapStateToProps> {

}

export class AppComponent extends React.Component<IAppProps> {

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
        const {coding, classes} = this.props;

        return (
            <Router>
                <div className={classes!.root}>
                    <TopBar/>
                    <div className={classes!.wrapper} id="wrapper1">
                        <div className={classes!.innerWrapper} id="inner-wrappe1r">
                            <div className={classes!.content} id="content">
                                {/*<div id='tabs' style={{*/}
                                    {/*backgroundColor: '#f8f9fb', height: 48, width: '100%', overflow: 'hidden'*/}
                                {/*}}>*/}
                                    <EditorTabs/>
                                {/*</div>*/}
                                <div id='editor'>
                                    {coding.editors.length > 0 ? <Editor/> : <Intro/>}
                                </div>
                            </div>
                            <div className={classes!.filler}/>
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

export const App = withStyles(styles as any)(connect(mapStateToProps)(AppComponent))



