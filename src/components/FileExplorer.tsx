import * as React from "react"
import {connect, Dispatch} from "react-redux"
import {bindActionCreators} from "redux";
import {RootAction, RootState} from "../store";
import {StyledComponentProps, Theme} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {newEditorTab} from "../store/editors/actions";
import {createFile, deleteFile, renameFile} from "../store/files/actions";
import classNames from 'classnames';
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import {copyToClipboard} from "../utils/copyToClipboard";

const styles = (theme: Theme) => ({
    root: {
        border: '1px solid black'
    },
    filesButton: {
        width: '20px',
        height: '100px'
    },
    label: {
        transform: 'rotate(-90deg)',
        '-webkit-transform': 'rotate(-90deg)',
        '-moz-transform': 'rotate(-90deg)',
        '-o-transform': 'rotate(-90deg)',
        '-ms-transform': 'rotate(-90deg)',

    },
    fileTree: {
        width: '100px',
        background: 'red'
    }
});

const mapStateToProps = (state: RootState) => ({
    files: state.files
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => bindActionCreators({
    newEditorTab,
    deleteFile,
    createFile,
    renameFile
}, dispatch);


interface IFileExplorerProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>> {
    className?: string
    styles?: Record<string, React.CSSProperties>
}

interface IFileExplorerState {
    open: boolean
}

class FileExplorer extends React.Component<IFileExplorerProps, IFileExplorerState> {
    state = {
        open: true
    }

    render() {
        const {newEditorTab, className: classNameProp, classes} = this.props;
        const {open} = this.state;
        const className = classNames(classes!.root, classNameProp);
        return <div className={className}>
            <button
                className={classes!.filesButton}
                onClick={() => this.setState({open: !open})}
            >
                <Typography className={classes!.label}>Files</Typography>
            </button>

            {open && <div className={classes!.fileTree}></div>}
        </div>
    }
}


export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(FileExplorer))



