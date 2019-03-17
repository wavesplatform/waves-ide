import React, { Component, KeyboardEvent } from 'react';
import { FilesStore, FILE_TYPE, TabsStore, IFile, TAB_TYPE } from '../../mobx-store';
import { inject, observer } from 'mobx-react';
import './style.css';
import { StyledComponentProps } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import { UserDialog } from '@components/UserDialog';
import classNames = require('classnames');
import Resizable, { ResizeCallback } from 're-resizable';
import Popover from 'antd/lib/Popover';
import Sider from 'antd/es/layout/Sider';
import Menu from 'antd/lib/menu';
import Icon from 'antd/lib/Icon';
import Input from 'antd/lib/Input';
import Dropdown from 'antd/lib/Dropdown';

const {SubMenu} = Menu;

interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}

interface IEditorTab {
    type: TAB_TYPE.EDITOR,
    fileId: string
}

interface IFileExplorerProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, IInjectedProps {
    className?: string
    styles?: Record<string, React.CSSProperties>
}

type IFileExplorerState = {
    open: boolean
    width: number
    lastWidth: number
    lastDelta: number
    editingTab: string
};

type TFilesStruct = {
    name: string
    key: string
    children: TFile[]
};

type TFile = { fileType: FILE_TYPE, name: string };

const styles = () => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        overflowY: 'hidden',
    },
    // expFooter: {
    //     backgroundColor: 'rgb(248,249,251)',
    //     position: 'absolute',
    //     left: '0',
    //     bottom: '0',
    //     width: '100%',
    //     height: '40px',
    //     padding: '10px',
    //     borderRight: '2px solid rgb(223, 229, 235)'
    // },
    // mainSubMenu: {
    //     background: '#f8f9fb'
    // },
    // boldText: {
    //     fontWeight: 'bold'
    // }
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
            lastDelta: 0,
            open: true,
            editingTab: ''
        };
    }

    newEmptyFile = (type: FILE_TYPE) => this.props.filesStore!.createFile({type, content: ''}, true);

    handleOpen = (fileId: string) => () => this.props.tabsStore!.openFile(fileId);

    handleRename = (key: string, name: string) => this.props.filesStore!.renameFile(key, name);

    handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    handleEnter = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({editingTab: ''});
        }
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
        let newWidth = lastWidth === 10 ? 0 : delta.width + lastWidth - this.state.lastDelta;
        this.updateState(newWidth, lastWidth, delta.width, true);
    };

    private handleResizeStop: ResizeCallback = () => {
        let open = this.state.width > defaultMinWidth;
        let width = open ? this.state.width : 10;
        this.updateState(width, 0, 0, open);
    };

    private updateState = (width: number, lastWidth: number, lastDelta: number, open: boolean): void =>
        this.setState({width, lastWidth, lastDelta, open});

    getButtons = (key: string) =>
        <div className="toolButtons">
            <Popover placement="bottom" content={<small>Rename</small>} trigger="hover">
                <Icon onClick={() => this.setState({editingTab: key})} type="edit" theme="filled"/>
            </Popover>
            <Popover placement="bottom" content={<small>Delete</small>} trigger="hover">
                <Icon onClick={this.handleDelete(key)} type="delete" theme="filled"/>
            </Popover>
        </div>;

    getFile = (key: string, name: string) =>
        <Menu.Item key={key} onClick={this.handleOpen(key)}>
            {
                this.state.editingTab === key ?
                    <Input
                        onChange={(e) => {
                            this.handleRename(key, e.target.value);
                        }}
                        onBlur={() => this.setState({editingTab: ''})}
                        value={name}
                        readOnly={false}
                        onFocus={this.handleFocus}
                        autoFocus={true}
                        onKeyDown={this.handleEnter}
                    />
                    : <span><Icon type="file" theme="filled"/>{name}</span>
            }
            {this.getButtons(key)}
        </Menu.Item>;

    getSubMenu = (key: string, name: string, files: IFile[], children?: TFile[]) =>
        <SubMenu className="mainSubMenu" key={key} title={<span>{name}</span>}>
            {(children || []).map(({fileType, name}) =>
                <SubMenu key={fileType}
                         title={<span className="boldText"><Icon type="folder" theme="filled"/>{name}</span>}>
                    {files.filter(file => file.type === fileType).map(file => this.getFile(file.id, file.name))}
                </SubMenu>)
            }
        </SubMenu>;


    render() {

        const {filesStore, className: classNameProp, classes, tabsStore} = this.props;
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

        const selectedTabs = tabsStore && tabsStore.tabs ?
            tabsStore.tabs.filter((_, i) => i === tabsStore.activeTabIndex)
            : [];
        return (
            <Resizable
                size={{width}}
                maxWidth={defaultMaxWidth}
                enable={resizeEnableDirections}
                defaultSize={{width}}
                onResizeStop={this.handleResizeStop}
                onResize={this.handleResize}
            >
                {this.state.open &&
                <div className={className}>
                    <Sider width={this.state.width as number} style={{backgroundColor: '#fff', height: '100%'}}>
                        <Menu mode="inline"
                              style={{height: '100%', borderRight: 0, color: 'rgb(128,144,163) !important'}}
                              selectedKeys={selectedTabs.map(({fileId}: IEditorTab) => fileId)}
                              defaultOpenKeys={[
                                  'files',
                                  FILE_TYPE.ACCOUNT_SCRIPT
                              ]}
                        >
                            {folders.map((folder) =>
                                this.getSubMenu(folder.key, folder.name, files, folder.children))}
                        </Menu>
                    </Sider>
                    <footer className="expFooter">
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item onClick={this.newEmptyFile.bind(this, FILE_TYPE.ACCOUNT_SCRIPT)}>
                                    <Icon type="file" theme="filled"/>Account script
                                </Menu.Item>
                                <Menu.Item onClick={this.newEmptyFile.bind(this, FILE_TYPE.ASSET_SCRIPT)}>
                                    <Icon type="file" theme="filled"/>Asset script
                                </Menu.Item>
                                <Menu.Item onClick={this.newEmptyFile.bind(this, FILE_TYPE.TEST)}>
                                    <Icon type="file" theme="filled"/>Test script
                                </Menu.Item>
                            </Menu>
                        } placement="topLeft">
                            <Icon style={{margin: '0 10px'}} type="plus-circle" theme="filled"/>
                        </Dropdown>
                    </footer>
                </div>}
            </Resizable>


        );
    }
}

export default withStyles(styles as any)(Explorer);
