import * as React from "react"
import {connect, Dispatch} from "react-redux"
import {bindActionCreators} from "redux";
import {RootAction, RootState} from "../store";
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import {filesActions} from "../store/files";
import {editorsActions} from "../store/editors";
import classNames from 'classnames';
import Typography from "@material-ui/core/Typography/Typography";
import {FILE_TYPE} from "../store/files/reducer";
import Button from "@material-ui/core/Button/Button";
import {userDialog} from "./UserDialog";

const styles = (theme: Theme) => ({
    root: {
        //border: '1px solid black',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        overflowY: 'hidden',
    },
    filesRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: 'transparent',
        justifyContent: 'space-between'
    },
    filesText: {
        paddingLeft: 10
    },
    filesButton: {
        width: '20px',
        height: '40px',
        background: 'white',
        //  alignSelf: 'flex-end',
        padding: 0,
        fontWeight: 'bold',
        minWidth: '20px'
    },
    // label: {
    //     transform: 'rotate(-90deg)',
    //     '-webkit-transform': 'rotate(-90deg)',
    //     '-moz-transform': 'rotate(-90deg)',
    //     '-o-transform': 'rotate(-90deg)',
    //     '-ms-transform': 'rotate(-90deg)',
    //
    // },
    fileTree: {
        // width: '150px',
        overflowY: 'auto',
        padding: 10
    },
    // root: {
    //     width: '100%',
    //     maxWidth: 360,
    //     backgroundColor: theme.palette.background.paper,
    // },
    nested: {
        paddingLeft: theme.spacing.unit * 2,
        display: 'flex',
        justifyContent: 'space-between'
    },
});

const mapStateToProps = (state: RootState) => ({
    files: state.files
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => bindActionCreators({
    onOpenFile: editorsActions.newEditorTab,
    onDeleteFile: filesActions.deleteFile,
    onCreateFile: filesActions.createFile,
    onRenameFile: filesActions.renameFile
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
            assetScript: true,
            accountScript: true
        }
    }

    handleClick = (folderName: string) => () => {
        this.setState(state => ({[folderName]: !state[folderName]}));
    };

    handleOpen = (fileId: string) => () => {
        this.props.onOpenFile({fileId})
    };

    handleDelete = (id: string) => (e: React.MouseEvent) => {
        const {onDeleteFile, files} = this.props;
        const file = files.find(file => file.id === id);
        const fileName = file && file.name;

        e.stopPropagation();

        userDialog.open("Delete", <p>Are you sure you want to delete&nbsp;
            <b>{fileName}</b>&nbsp;?</p>, {
            "Cancel": () => {
                return true
            },
            "Delete": () => {
                onDeleteFile({id});
                return true
            }
        })
    };

    render() {
        const {files, className: classNameProp, classes} = this.props;
        const className = classNames(classes!.root, classNameProp);

        const folders = [
            {fileType: FILE_TYPE.ACCOUNT_SCRIPT, name: 'Account scripts'},
            {fileType: FILE_TYPE.ASSET_SCRIPT, name: 'Asset scripts'},
            // {fileType: FILE_TYPE.CONTRACT, name: 'Smart contracts'}
        ];

        return <div className={className}>
            <div className={classes!.filesRow}>
                {this.state.open && <Typography className={classes!.filesText} children={'Files'}/>}
                <Button
                    type={"text"}
                    className={classes!.filesButton}
                    onClick={() => this.setState({open: !this.state.open})}
                >
                    {this.state.open ? "<" : ">"}
                </Button>
            </div>
            {this.state.open &&
            <List
                component="nav"
                className={classes!.fileTree}
            >
                {folders.map(({fileType, name}) => (<React.Fragment key={fileType}>
                    <ListItem button dense disableGutters onClick={this.handleClick(fileType)}>
                        <ListItemIcon>
                            <FolderIcon/>
                        </ListItemIcon>
                        {name}
                        {this.state[fileType] ? <ExpandLess style={{marginLeft: 'auto'}}/> :
                            <ExpandMore style={{marginLeft: 'auto'}}/>}
                    </ListItem>
                    <Collapse in={this.state[fileType]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {files.filter(file => file.type === fileType).map(file => (
                                <ListItem button dense disableGutters className={classes!.nested} key={file.id}
                                          onDoubleClick={this.handleOpen(file.id)}>
                                    <ListItemIcon>
                                        <InsertDriveFileIcon fontSize="small"/>
                                    </ListItemIcon>
                                    {file.name}
                                    <IconButton style={{padding: '0px', marginLeft: '12px'}}
                                                onClick={this.handleDelete(file.id)}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </React.Fragment>))}
            </List>
            }
        </div>
    }
}


export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(FileExplorer))



