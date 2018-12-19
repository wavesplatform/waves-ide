import * as React from "react"
import {connect} from "react-redux"
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Editor} from "./components/editor"
import {getReplState, RootState, store} from './store'
import {TopBar} from './components/topBar'
import EditorTabs from './components/editorTabs'
import {Intro} from './components/intro'
import {UserNotification} from './components/userNotification'
import {UserDialog} from "./components/userDialog";
import {SettingsDialog} from "./components/settingsDialog";
import {WizardDialog} from "./components/wizardDialog";
import {RightTabs} from "./components/right-tabs"
import FileExplorer from "./components/FileExplorer"
import {Repl} from 'waves-repl'
import {TransactionSigningDialog} from "./components/TransactionSigning";
import {TxGeneratorDialog} from "./components/TxGeneratorDialog";
import {StyledComponentProps, Theme, withStyles} from "@material-ui/core";
import {createFile} from "./store/files/actions";
import {FILE_TYPE} from "./store/files/reducer";

const styles = (theme: Theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "rgb(248, 249, 251)",
    },

    mainField: {
        display: 'flex',
        flex: 2,
        flexDirection: 'row',
    },
    editorField: {
        height: '100%',
        flex: '1 1 auto',
        overflow: 'hidden',
        margin: '0 1% 0 0%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
    },
    editor: {
        flex: 1,
        overflow: 'hidden',
       // height: '100%',
       // width: '100%',
        padding: '6px',
        border: '1px solid red'
        //overflowY: 'auto'
    },
    rightTabsField: {
        height: '100%',
        maxWidth: '25%',
        backgroundColor: 'white',
    },
    repl: {
        borderTop: '2px solid #E5E7E9',
        backgroundColor: 'white',
        flex: 1,
        overflow: 'auto'
    }
});

const mapStateToProps = (state: RootState) => ({
    editors: state.editors
})

interface IAppProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    ReturnType<typeof mapStateToProps> {

}

export class AppComponent extends React.Component<IAppProps> {

    private handleExternalCommand(e: any) {
        //if (e.origin !== 'ORIGIN' || !e.data || !e.data.command) return;
        const data = e.data;
        switch (data.command) {
            case 'CREATE_NEW_CONTRACT':
                store.dispatch(createFile({
                    type: data.fileType || FILE_TYPE.ACCOUNT_SCRIPT,
                    content: data.code,
                    name: data.label
                }))
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
        const {editors, classes} = this.props;

        return (
            <Router>
                <div className={classes!.root}>
                    <TopBar/>
                    <div className={classes!.mainField}>
                        <FileExplorer/>
                        <div className={classes!.editorField}>
                            <EditorTabs/>
                            <div className={classes!.editor}>
                                {editors.editors.length > 0 ? <Editor/> : <Intro/>}
                            </div>
                        </div>
                        <RightTabs className={classes!.rightTabsField}/>
                    </div>
                    <div className={classes!.repl}>
                        <Repl theme='light'/>
                    </div>
                    <Route path="/settings" component={SettingsDialog}/>
                    <Route path="/wizard/multisig" component={WizardDialog}/>
                    <Route path="/signer" component={TransactionSigningDialog}/>
                    <Route path="/txGenerator" component={TxGeneratorDialog}/>
                    <UserNotification/>
                    <UserDialog/>
                </div>
            </Router>
        )
    }
}

export const App = withStyles(styles as any)(connect(mapStateToProps)(AppComponent))



