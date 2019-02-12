import * as React from "react"
import {connect} from "react-redux"
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Editor} from "./components/Editor"
import {selectReplState, RootState, store} from './store'
import TopBar from './components/TopBar'
import EditorTabs from './components/EditorTabs'
import {Intro} from './components/intro'
import {UserNotification} from './components/UserNotification'
import {UserDialog} from "./components/UserDialog";
import {SettingsDialog} from "./components/SettingsDialog";
import {WizardDialog} from "./components/WizardDialog";
import {RightTabs} from "./components/RightTabs"
import FileExplorer from "./components/FileExplorer"
import {Repl} from 'waves-repl'
import ReplWrapper from "./components/ReplWrapper";

import {TransactionSigningDialog} from "./components/TransactionSigning";
import {TxGeneratorDialog} from "./components/TxGeneratorDialog";
import {StyledComponentProps, Theme, withStyles} from "@material-ui/core/styles";
import {createFile} from "./store/files/actions";
import {FILE_TYPE} from "./store/files/reducer";
import {getCurrentFile} from "./store/file-manager-mw";

import {createSandbox, addTest, runTest} from './utils/testsSandbox';

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
        flex: 1,
        flexDirection: 'row',
        minHeight: 0
    },
    fileExplorer: {
        borderRight: '2px solid #E5E7E9',
        //Todo: this fixes https://github.com/mui-org/material-ui/issues/12524. Should make this example https://codesandbox.io/s/n5lowo693m always fail and write on github thread
        flexShrink: 0,
        //maxWidth: '13%'
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
        // border: '1px solid red'
        //overflowY: 'auto'
    },
    rightTabsField: {
        height: '100%',
        maxWidth: '25%',
        backgroundColor: 'white',
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
        window.addEventListener("message", this.handleExternalCommand.bind(this));

        Repl.updateEnv(selectReplState(store.getState()));

        //Create and bind to console function, resposible for getting file content
        const fileContent = (fileName?: string) => {
            const fullState = store.getState();
            if (!fileName) {
                const currentFile = getCurrentFile(fullState);
                return currentFile && currentFile.content
            }
            const {files} = fullState;
            const file = files.find(file=> file.name === fileName);
            return file && file.content

        };
        Repl.updateEnv({file: fileContent});

        createSandbox();
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleExternalCommand.bind(this))
    }

    runMocha = () => {
        addTest();
        runTest();
    };

    render() {
        const {editors, classes} = this.props;

        return (
            <Router>
                <div className={classes!.root}>
                    <div onClick={this.runMocha}>Запустить тест</div>
                    <TopBar/>
                    <div className={classes!.mainField}>
                        <FileExplorer className={classes!.fileExplorer}/>
                        <div className={classes!.editorField}>
                            {editors.editors.length > 0 ?
                                <React.Fragment>
                                    <EditorTabs/>
                                    <div className={classes!.editor}>
                                        <Editor/>
                                    </div>
                                </React.Fragment>
                                :
                                <Intro/>
                            }
                        </div>
                        <RightTabs className={classes!.rightTabsField}/>
                    </div>
                    
                    <ReplWrapper/>

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



