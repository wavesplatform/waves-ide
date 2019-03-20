import * as React from 'react';
import { StyledComponentProps, Theme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import withStyles from '@material-ui/core/styles/withStyles';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';
import { UserDialog } from './UserDialog';
import { FilesStore, TabsStore } from '@stores';
import { FILE_TYPE } from '@src/types';
import { inject, observer } from 'mobx-react';

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
    fileTree: {
        // width: '150px',
        overflowY: 'auto',
        padding: 10
    },
    nested: {
        paddingLeft: theme.spacing.unit * 2,
        display: 'flex',
        justifyContent: 'space-between'
    },
});

interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}

interface IFileExplorerProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, IInjectedProps {
    className?: string
    styles?: Record<string, React.CSSProperties>
}

type IFileExplorerState = {
    [key: string]: boolean
};

@inject('filesStore', 'tabsStore')
@observer
class FileExplorer extends React.Component<IFileExplorerProps, IFileExplorerState> {

    constructor(props: IFileExplorerProps) {
        super(props);

        this.state = {
            open: true
        };
    }

    handleClick = (folderName: string) => () => {
        this.setState(state => ({[folderName]: !state[folderName]}));
    };

    handleOpen = (fileId: string) => () => {
        this.props.tabsStore!.openFile(fileId);
    };

    handleDelete = (id: string) => (e: React.MouseEvent) => {
        const {filesStore} = this.props;
        const file = filesStore!.fileById(id);
        const fileName = file && file.name;

        e.stopPropagation();

        UserDialog.open('Delete', <p>Are you sure you want to delete&nbsp;
            <b>{fileName}</b>&nbsp;?</p>, {
            'Cancel': () => {
                return true;
            },
            'Delete': () => {
                filesStore!.deleteFile(id);
                return true;
            }
        });
    };

    render() {
        const {filesStore, className: classNameProp, classes} = this.props;
        const files = filesStore!.files;
        const className = classNames(classes!.root, classNameProp);

        const folders = [
            {fileType: FILE_TYPE.ACCOUNT_SCRIPT, name: 'Account scripts'},
            {fileType: FILE_TYPE.ASSET_SCRIPT, name: 'Asset scripts'},
            {fileType: FILE_TYPE.TEST, name: 'Tests'}
        ];

        return <div className={className}>
            <div className={classes!.filesRow}>
                {this.state.open && <Typography className={classes!.filesText} children={'Files'}/>}
                <Button
                    type={'text'}
                    className={classes!.filesButton}
                    onClick={() => this.setState({open: !this.state.open})}
                >
                    {this.state.open ? '<' : '>'}
                </Button>
            </div>
            {this.state.open &&
            <List
                component="nav"
                className={classes!.fileTree}
            >
                {folders.map(({fileType, name}) => (<React.Fragment key={fileType}>
                    <ListItem button dense disableGutters onClick={this.handleClick(name)}>
                        <ListItemIcon>
                            <FolderIcon/>
                        </ListItemIcon>
                        {name}
                        {this.state[name] ? <ExpandLess style={{marginLeft: 'auto'}}/> :
                            <ExpandMore style={{marginLeft: 'auto'}}/>}
                    </ListItem>
                    <Collapse in={this.state[name]} timeout="auto" unmountOnExit>
                        <List disablePadding>
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
        </div>;
    }
}

export default withStyles(styles as any)(FileExplorer);



