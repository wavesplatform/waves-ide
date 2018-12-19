import * as React from "react"
import {connect, Dispatch} from "react-redux"
import {bindActionCreators} from "redux";
import {RootAction, RootState} from "../store";
import {StyledComponentProps, Theme} from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import {newEditorTab} from "../store/editors/actions";
import {createFile, deleteFile, renameFile} from "../store/files/actions";
import classNames from 'classnames';
import Typography from "@material-ui/core/Typography/Typography";
import {FILE_TYPE} from "../store/files/reducer";

const styles = (theme: Theme) => ({
    root: {
        border: '1px solid black',
        overflowY: 'auto',
    },
    filesButton: {
        width: '20px',
        height: '40px'
    },
    label: {
        transform: 'rotate(-90deg)',
        '-webkit-transform': 'rotate(-90deg)',
        '-moz-transform': 'rotate(-90deg)',
        '-o-transform': 'rotate(-90deg)',
        '-ms-transform': 'rotate(-90deg)',

    },
    fileTree: {
        width: '150px',
        background: 'white'
    },
    // root: {
    //     width: '100%',
    //     maxWidth: 360,
    //     backgroundColor: theme.palette.background.paper,
    // },
    nested: {
        paddingLeft: theme.spacing.unit * 2,
    },
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

type IFileExplorerState = {
    [key: string]: boolean
}

class FileExplorer extends React.Component<IFileExplorerProps, IFileExplorerState> {

    constructor(props: IFileExplorerProps) {
        super(props);

        this.state = {
            open: true,
            assetScripts: true,
            accountScripts: true
        }
    }

    handleClick = (folderName: string) => () => {
        this.setState(state => ({[folderName]: !state[folderName]}));
    };

    render() {
        const {newEditorTab, deleteFile, files, className: classNameProp, classes} = this.props;
        const className = classNames(classes!.root, classNameProp);

        const fileTypes = [FILE_TYPE.ACCOUNT_SCRIPT, FILE_TYPE.TOKEN_SCRIPT];

        return <div className={className}>
            <button
                className={classes!.filesButton}
                onClick={() => this.setState({open: !open})}
            >
                <Typography className={classes!.label}>F</Typography>
            </button>

            {this.state.open &&
            <List
                component="nav"
                className={classes!.fileTree}
            >
                {fileTypes.map(fileType => (<React.Fragment key={fileType}>
                    <ListItem button dense disableGutters onClick={this.handleClick(fileType)}>
                        <ListItemIcon>
                            <FolderIcon/>
                        </ListItemIcon>
                        <ListItemText inset primary={fileType}/>
                        {this.state[fileType] ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                    <Collapse in={this.state[fileType]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {files.filter(file => file.type === fileType).map(file => (
                                <ListItem button dense disableGutters className={classes!.nested}>
                                    <ListItemIcon>
                                        <InsertDriveFileIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText inset primary={file.name}/>
                                    <IconButton onClick={() => deleteFile({id: file.id})}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </React.Fragment>))}


                {/*<ListItem button dense disableGutters onClick={this.handleClick('accountScript')}>*/}
                {/*<ListItemIcon>*/}
                {/*<FolderIcon/>*/}
                {/*</ListItemIcon>*/}
                {/*<ListItemText inset primary="Account scripts" />*/}
                {/*{this.state.accountScriptsOpen ? <ExpandLess /> : <ExpandMore />}*/}
                {/*</ListItem>*/}
                {/*<Collapse in={this.state.accountScriptsOpen} timeout="auto" unmountOnExit>*/}
                {/*<List component="div" disablePadding>*/}
                {/*<ListItem button className={classes!.nested}>*/}
                {/*<ListItemIcon>*/}
                {/*<InsertDriveFile />*/}
                {/*</ListItemIcon>*/}
                {/*<ListItemText inset primary="Starred" />*/}
                {/*</ListItem>*/}
                {/*</List>*/}
                {/*</Collapse>*/}
                {/*<ListItem  button dense disableGutters onClick={this.handleClick('assetScript')}>*/}
                {/*<ListItemIcon>*/}
                {/*<FolderIcon />*/}
                {/*</ListItemIcon>*/}
                {/*<ListItemText inset primary="Asset scripts" />*/}
                {/*{this.state.assetScriptsOpen ? <ExpandLess /> : <ExpandMore />}*/}
                {/*</ListItem>*/}
                {/*<Collapse in={this.state.assetScriptsOpen} timeout="auto" unmountOnExit>*/}
                {/*<List component="div" disablePadding>*/}
                {/*<ListItem button className={classes!.nested}>*/}
                {/*<ListItemIcon>*/}
                {/*<InsertDriveFile />*/}
                {/*</ListItemIcon>*/}
                {/*<ListItemText inset primary="Starred" />*/}
                {/*</ListItem>*/}
                {/*</List>*/}
                {/*</Collapse>*/}
            </List>
            }
        </div>
    }
}


export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(FileExplorer))



