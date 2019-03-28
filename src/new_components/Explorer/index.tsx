import React from 'react';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, FilesStore, IFile, TAB_TYPE, TabsStore } from '@stores';

import Menu, { MenuItem, SubMenu } from 'rc-menu';
import Popover from 'rc-tooltip';

import { UserDialog } from '@components/UserDialog';

import 'rc-menu/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'rc-dropdown/assets/index.css';
import styles from './styles.less';
import icons from '../icons';

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

type TFile = { fileType: 'tutorials' | 'smart-accounts' | 'smart-assets', name: string };

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
class Explorer extends React.Component<IInjectedProps, IFileExplorerState> {
    state: IFileExplorerState = {
        editingTab: ''
    };

    private handleOpen = (fileId: string) => () => this.props.tabsStore!.openFile(fileId);

    private handleRename = (key: string, name: string) => this.props.filesStore!.renameFile(key, name);

    private handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({editingTab: ''});
        }
    };

    private handleDelete = (id: string) => (e: React.MouseEvent) => {
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


    //todo delete mapOfTypes
    private handleLoadExample = (type: string, name: string, content: string) => {
        const mapOfTypes: Record<string, FILE_TYPE> = {
            'smart-assets': FILE_TYPE.ASSET_SCRIPT,
            'smart-accounts': FILE_TYPE.ACCOUNT_SCRIPT
        };

        this.props.filesStore!.createFile({type: mapOfTypes[type], name, content}, true);
    };
    private getButtons = (key: string) => (
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <span onClick={() => this.setState({editingTab: key})}>{icons.edit}</span>
            </Popover>
            <Popover placement="bottom" overlay={<p>Delete</p>} trigger="hover">
                <span onClick={this.handleDelete(key)}>{icons.delete}</span>
            </Popover>
        </div>
    );

    private getFile = (key: string, name: string) => (
        <MenuItem key={key} onClick={this.handleOpen(key)}>
            {this.state.editingTab === key
                ? (
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
                )
                : (
                    <span>{icons.file}{name}</span>
                )
            }

            {this.getButtons(key)}
        </MenuItem>
    );

    private getFileMenu = (type: string, name: string, files: IFile[]) =>
        <SubMenu key={type} title={<span>{name}</span>}>
            {files.filter(file => file.type === type).map(file => this.getFile(file.id, file.name))}
        </SubMenu>;

    private getLibMenu = (key: string, name: string, files: IFile[], children: TFile[]) => (
        <SubMenu key={key} title={<span>{name}</span>}>
            {(children).map(({fileType, name}) =>
                <SubMenu key={fileType} title={<span className={styles.boldText}>{icons.folder}{name}</span>}>
                    {
                        examples[fileType] && examples[fileType].map(
                            ({name, dir, content}: IExampleType, i) =>
                                <MenuItem key={i} onClick={() => this.handleLoadExample(fileType, name, content)}>
                                    <span>{icons.file}{name}</span>
                                </MenuItem>
                        )
                    }
                </SubMenu>
            )}
        </SubMenu>
    );

    render() {
        const {
            filesStore,
            tabsStore
        } = this.props;


        const files = filesStore!.files



        //TODO REMOVE THIS ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌
            .map((file: IFile) => {                                                                    // ❌
                if (file.type === FILE_TYPE.ACCOUNT_SCRIPT || file.type === FILE_TYPE.ASSET_SCRIPT) {            // ❌
                    return {...file, type: FILE_TYPE.RIDE};                                                      // ❌
                } else if (file.type === FILE_TYPE.TEST) {                                                       // ❌
                    return {...file, type: FILE_TYPE.JAVA_SCRIPT};                                               // ❌
                } else {                                                                                         // ❌
                    return file;                                                                                 // ❌
                }                                                                                                // ❌
            });                                                                                                  // ❌
        //TODO REMOVE THIS ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌


        const activeTab = tabsStore!.activeTab;
        const selectedKeys = activeTab && activeTab.type === TAB_TYPE.EDITOR ? [activeTab.fileId] : [];
        return (
            <div className={styles.root}>
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    defaultOpenKeys={[FILE_TYPE.RIDE]}
                >
                    {this.getFileMenu(FILE_TYPE.RIDE, 'Your files', files)}
                    {this.getLibMenu('library', 'Library', files, [
                        {fileType: 'tutorials', name: 'Tutorials'},
                        {fileType: 'smart-accounts', name: 'Samples smart-accounts'},
                        {fileType: 'smart-assets', name: 'Samples smart-assets'}]
                    )}
                    {this.getFileMenu(FILE_TYPE.JAVA_SCRIPT, 'Tests', files)}
                </Menu>
            </div>
        );
    }
}

export default Explorer;
