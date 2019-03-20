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
import icons from './icons';


interface IExampleType {
    name: string,
    dir: string
    content: string
}

interface IEditorTab {
    type: TAB_TYPE.EDITOR,
    fileId: string
}

const examples: Record<string, IExampleType[]> = require('../../gitExamples.json');


type TFile = { fileType: FILE_TYPE, name: string };

type TFilesStruct = {
    name: string
    key: string
    children: TFile[]
};

type IFileExplorerState = {
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
            {icons.file} Account script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.ASSET_SCRIPT)}>
            {icons.file} Asset script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.TEST)}>{icons.file} Test script</MenuItem>
    </Menu>;


    getButtons = (key: string) =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <span onClick={() => this.setState({editingTab: key})}>{icons.edit}</span>
            </Popover>
            <Popover placement="bottom" overlay={<p>Delete</p>} trigger="hover">
                <span onClick={this.handleDelete(key)}>{icons.delete}</span>
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
                    <span>{icons.file}{name}</span>
            }
            {this.getButtons(key)}
        </MenuItem>;

    getSubMenu = (key: string, name: string, files: IFile[], children?: TFile[]) =>
        <SubMenu key={key} title={<span>{name}</span>}>
            {(children || []).map(({fileType, name}) =>
                (fileType === FILE_TYPE.ACCOUNT_SAMPLES || fileType === FILE_TYPE.ASSET_SAMPLES) ?
                    <SubMenu key={fileType} title={<span className={styles.boldText}>{icons.folder}{name}</span>}>
                        {
                            examples[fileType].map((
                                ({name, dir, content}: IExampleType, i) =>
                                    <MenuItem key={i} onClick={() => this.handleLoadExample(fileType, name, content)}>
                                        <span>{icons.file}{name}</span>
                                    </MenuItem>
                            ))}
                    </SubMenu>
                    :
                    <SubMenu key={fileType}
                             className={styles.leftArrow}
                             title={<span className={styles.boldText}>{icons.folder}{name}</span>}>
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

        return <Menu
                mode="inline"
                selectedKeys={selectedTabs.map(({fileId}: IEditorTab) => fileId)}
                defaultOpenKeys={[
                    'files',
                    FILE_TYPE.ACCOUNT_SCRIPT,
                    FILE_TYPE.ASSET_SCRIPT
                ]}
            >
                {folders.map((folder) =>
                    this.getSubMenu(folder.key, folder.name, files, folder.children))}
            </Menu>;
    }
}
