import React from 'react';
import { inject, observer } from 'mobx-react';
import { FilesStore, FILE_TYPE, TabsStore, IFile, TAB_TYPE } from '../../mobx-store';

import styles from './styles.less';
import 'rc-menu/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'rc-dropdown/assets/index.css';
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import Popover from 'rc-tooltip';
import Dropdown from 'rc-dropdown';
import { UserDialog } from '@components/UserDialog';

interface IExampleType {
    name: string,
    dir: string
    content: string
}

const examples: Record<string, IExampleType[]> = require('../../gitExamples.json');


type TFile = { fileType: FILE_TYPE, name: string };

type TFilesStruct = {
    name: string
    key: string
    children: TFile[]
};

type IFileExplorerState = {
    open: boolean
    editingTab: string
};

interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}


@inject('filesStore', 'tabsStore')
@observer
export default class Explorer extends React.Component<IInjectedProps, IFileExplorerState> {

    constructor(props: IInjectedProps) {
        super(props);

        this.state = {
            open: true,
            editingTab: ''
        };
    }


    icons = {
        file: <i>
            <svg viewBox="64 64 896 896"   width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path
                    d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7
                    14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2z"/>
            </svg>
        </i>,
        folder: <i>
            <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path
                    d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32
                     32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32z"/>
            </svg>
        </i>,
        plus: <i>
            <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path
                    d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm192 472c0
                    4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4
                    3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z"/>
            </svg>
        </i>,
        edit: <i aria-label="icon: edit" className="anticon anticon-edit">
            <svg viewBox="64 64 896 896" className="" data-icon="edit" width="1em" height="1em" fill="currentColor"
                 aria-hidden="true">
                <path
                    d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z"></path>
            </svg>
        </i>,
        delete: <i>
            <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path
                    d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c
                    0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4
                    .4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-200 0H360v-72h304v72z"/>
            </svg>
        </i>

    };

    newEmptyFile = (type: FILE_TYPE) => this.props.filesStore!.createFile({type, content: ''}, true);

    handleOpen = (fileId: string) => () => this.props.tabsStore!.openFile(fileId);

    handleRename = (key: string, name: string) => this.props.filesStore!.renameFile(key, name);

    handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    handleEnter = (e: React.KeyboardEvent) => {
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

    handleLoadExample = (type: string, name: string, content: string) => {
        const mapOfTypes: Record<string, FILE_TYPE> = {
            'smart-assets': FILE_TYPE.ASSET_SCRIPT,
            'smart-accounts': FILE_TYPE.ACCOUNT_SCRIPT
        };
        this.props.filesStore!.createFile({type: mapOfTypes[type], name, content}, true);
    };

    getMenu = () => <Menu>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.ACCOUNT_SCRIPT)}>
            {this.icons.file} Account script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.ASSET_SCRIPT)}>
            {this.icons.file} Asset script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.TEST)}>{this.icons.file} Test script</MenuItem>
    </Menu>;


    getButtons = (key: string) =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <span onClick={() => this.setState({editingTab: key})}>{this.icons.edit}</span>
            </Popover>
            <Popover placement="bottom" overlay={<p>Delete</p>} trigger="hover">
                <span onClick={this.handleDelete(key)}>{this.icons.delete}</span>
            </Popover>
        </div>;

    getFile = (key: string, name: string) =>
        <MenuItem key={key} onClick={this.handleOpen(key)}>
            {
                this.state.editingTab === key ?
                    <input
                        onChange={(e) => {
                            this.handleRename(key, e.target.value);
                        }}
                        onBlur={() => this.setState({editingTab: ''})}
                        value={name}
                        readOnly={false}
                        onFocus={this.handleFocus}
                        autoFocus={true}
                        onKeyDown={(e) => this.handleEnter(e)}
                    />
                    :
                    <span>{this.icons.file}{name}</span>
            }
            {this.getButtons(key)}
        </MenuItem>;

    getSubMenu = (key: string, name: string, files: IFile[], children?: TFile[]) =>
        <SubMenu key={key} title={<span>{name}</span>}>
            {(children || []).map(({fileType, name}) =>
                (fileType === FILE_TYPE.ACCOUNT_SAMPLES || fileType === FILE_TYPE.ASSET_SAMPLES) ?
                    <SubMenu key={fileType} title={<span className={styles.boldText}>{this.icons.folder}{name}</span>}>
                        {
                            examples[fileType].map((
                                ({name, dir, content}: IExampleType, i) =>
                                    <MenuItem key={i} onClick={() => this.handleLoadExample(fileType, name, content)}>
                                        <span>{this.icons.file}{name}</span>
                                    </MenuItem>
                            ))}
                    </SubMenu>
                    :
                    <SubMenu key={fileType}
                             className={styles.leftArrow}
                             title={<span className={styles.boldText}>{this.icons.folder}{name}</span>}>
                        {files.filter(file => file.type === fileType).map(file => this.getFile(file.id, file.name))}
                    </SubMenu>)
            }
        </SubMenu>;


    render() {


        const {filesStore, tabsStore} = this.props;
        const files = filesStore!.files;
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
                    {fileType: FILE_TYPE.ACCOUNT_SAMPLES, name: 'Samples smart-accounts'},
                    {fileType: FILE_TYPE.ASSET_SAMPLES, name: 'Samples smart-assets'},
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

        const selectedTabs = tabsStore && tabsStore.tabs ?
            tabsStore.tabs.filter((_, i) => i === tabsStore.activeTabIndex)
            : [];

        return <div className={styles.root}>
            <Menu mode="inline">
                {folders.map((folder) =>
                    this.getSubMenu(folder.key, folder.name, files, folder.children))}
            </Menu>
            <footer className={styles.expFooter}>
                <Dropdown overlay={this.getMenu()}>{this.icons.plus}</Dropdown>
            </footer>
        </div>;
    }
}
