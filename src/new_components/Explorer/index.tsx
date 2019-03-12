import React, { Component } from 'react';
import { FilesStore, FILE_TYPE, TabsStore, IFile } from '../../mobx-store';
import { inject, observer } from 'mobx-react';
import './style.css';
import Menu from 'antd/es/menu';
import Icon from 'antd/es/icon';
import Sider from 'antd/es/layout/Sider';
import { StyledComponentProps, Theme } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames = require('classnames');
import { UserDialog } from '@components/UserDialog';
import Resizable, { ResizeCallback } from 're-resizable';

const {SubMenu} = Menu;

interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}


interface IFileExplorerProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, IInjectedProps {
    className?: string
    styles?: Record<string, React.CSSProperties>
}

type IFileExplorerState = {
    open: boolean
    width: number
    lastWidth: number
};

type TFilesStruct = {
    name: string
    key: string
    children: TFile[]
};

type TFile = { fileType: FILE_TYPE, name: string };
// const isTFile = (item: any): item is TFile => item.fileType !== undefined;

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

const defaultMinWidth = 200;
const defaultMaxWidth = 500;

@inject('filesStore', 'tabsStore')
@observer
class Explorer extends Component<IFileExplorerProps, IFileExplorerState> {


    constructor(props: IFileExplorerProps) {
        super(props);

        this.state = {
            width: 300,
            lastWidth: 300,
            open: true,
        };
    }

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

    private handleResize: ResizeCallback = (event, direction, elementRef, delta) => {
        const lastWidth = this.state.width;
        let newWidth = delta.width + lastWidth;
        let open = true;

        if (newWidth > defaultMaxWidth) newWidth = defaultMaxWidth;
        else if (lastWidth === 24) {
            newWidth = defaultMinWidth;
            open = true;
        }else if (newWidth < defaultMinWidth) {
            newWidth = 24;
            open = false;
        }

        this.updateState(newWidth, lastWidth, open);
    };

    private updateState = (
        width: number,
        lastWidth: number,
        open: boolean,
    ): void => {

        this.setState({
            width,
            lastWidth,
            open
        });
    };

    getButtons = (key: string, name: string) =>
        <div style={{float: 'right'}}>
            <Icon onClick={this.renameHandler.bind(this, key, name)} type="edit" theme="filled"/>
            <Icon onClick={this.handleDelete(key)} type="delete" theme="filled"/>
        </div>;

    getFile = (key: string, name: string) =>
        <Menu.Item key={key} onClick={this.handleOpen(key)}><Icon type="file" theme="filled"/>
            <span style={{width: ((this.state.width as number) - 48)}}>{name}</span>{this.getButtons(key, name)}
        </Menu.Item>;

    //style={{width: ((this.state.width as number ) - 48) + 'px'}}
    getSubMenu = (key: string, name: string, files: IFile[], children?: TFile[]) =>
        <SubMenu style={{background: '#f8f9fb'}} key={key} title={<span>{name}</span>}>
            {(children || []).map(({fileType, name}) =>
                <SubMenu key={fileType} title={<span><Icon type="folder" theme="filled"/>{name}</span>}>
                    {files.filter(file => file.type === fileType).map(file => this.getFile(file.id, file.name))}
                </SubMenu>)
            }
        </SubMenu>;

    renameHandler = (key: string, name: string) => {
        alert('rename' + ' ' + key + ' ' + name);
    };


    render() {

        const {filesStore, className: classNameProp, classes} = this.props;
        const files = filesStore!.files;
        let className = classNames(classes!.root, classNameProp);
        const folders: TFilesStruct[] = [
            {
                name: 'Your files',
                key: 'files',
                children: [
                    {fileType: FILE_TYPE.ACCOUNT_SCRIPT, name: 'Account scripts'},
                    {fileType: FILE_TYPE.ASSET_SCRIPT, name: 'Asset scripts'},
                    {fileType: FILE_TYPE.DELETED, name: 'Deleted'}
                ],
            },
            {
                name: 'Library',
                key: 'library',
                children: [
                    {fileType: FILE_TYPE.TUTORIALS, name: 'Tutorials'},
                    {fileType: FILE_TYPE.SAMPLES, name: 'Samples'},
                ]
            },
            {
                name: 'Tests',
                key: 'tests',
                children: [
                    {fileType: FILE_TYPE.TEST, name: 'Your tests'}
                ]
            }
        ];

        className += ' noScroll';

        const width = this.state.width as number;
        const resizeEnableDirections = {
            top: false, right: true, bottom: false, left: false,
            topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
        };


        return (
            <Resizable
                size={{width}}
                maxWidth={defaultMaxWidth}
                enable={resizeEnableDirections}
                defaultSize={{width}}
                onResizeStop={this.handleResize}
            >
                {this.state.open &&
                <div className={className}>
                    <Sider width={this.state.width as number} style={{backgroundColor: '#fff', height: '100%'}}>
                        <Menu mode="inline" style={{height: '100%', borderRight: 0}}>

                            {folders.map((folder) =>
                                this.getSubMenu(folder.key, folder.name, files, folder.children))}

                        </Menu>
                    </Sider>
                </div>}
            </Resizable>


        );
    }
}

export default withStyles(styles as any)(Explorer);
