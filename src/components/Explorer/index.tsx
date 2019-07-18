import React from 'react';
import { inject, observer } from 'mobx-react';
import { saveAs } from 'file-saver';
import { FILE_TYPE, FilesStore, TAB_TYPE, TabsStore, TFile } from '@stores';
import Scrollbar from '@src/components/Scrollbar';
import Menu, { MenuItem, SubMenu } from 'rc-menu';
import styles from './styles.less';
import DeleteConfirm from '@src/components/DeleteConfirm';
import { isFolder, TFolder } from '@stores/FilesStore';
import classNames from 'classnames'

type IFileExplorerState = {
    editingFile: string
};

interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}


@inject('filesStore', 'tabsStore')
@observer
class Explorer extends React.Component<IInjectedProps, IFileExplorerState> {
    state: IFileExplorerState = {
        editingFile: ''
    };

    private getFileIcon = (file: TFile) => {
        let icon = <div className="accountdoc-16-basic-600"/>;
        if (file.type === FILE_TYPE.RIDE) {
            switch (file.info.type) {
                case 'account':
                    icon = <div className="accountdoc-16-basic-600"/>;
                    break;
                case 'asset':
                    icon = <div className="assetdoc-diamond-16-basic-600"/>;
                    break;
                case 'dApp':
                    icon = <div className="dapps-16-basic-600"/>;
                    break;
            }
        } else if (file.type === FILE_TYPE.JAVA_SCRIPT) {
            icon = <div className="test-16-basic-600"/>;
        }
        return icon;
    };


    private handleOpen = (fileId: string) => () => this.props.tabsStore!.openFile(fileId);

    private handleOpenWelcomePage = () => {
        const {tabsStore} = this.props;
        if (!tabsStore) return;
        const index = tabsStore.tabs.findIndex(tab => tab.type === TAB_TYPE.WELCOME);
        if (index === -1) tabsStore.addTab({type: TAB_TYPE.WELCOME});
        else tabsStore.selectTab(index);
    };

    private handleOpenKeyboardShortcutsPage = () => {
        const {tabsStore} = this.props;
        if (!tabsStore) return;
        const index = tabsStore.tabs.findIndex(tab => tab.type === TAB_TYPE.HOTKEYS);
        if (index === -1) tabsStore.addTab({type: TAB_TYPE.HOTKEYS});
        else tabsStore.selectTab(index);
    };

    private handleRename = (key: string, name: string) => {
        this.props.filesStore!.renameFile(key, name);
    };

    private handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target;
        input.setSelectionRange(0, input.value.length);
    };

    private handleDownload = (fileId: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        const file = this.props.filesStore!.fileById(fileId);
        if (!file) {
            console.error(`Failed to get file with id: ${fileId}`);
            return;
        }

        const blob = new Blob([file.content], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, file.name);
    };

    private handleEdit = (fileId: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState({editingFile: fileId});
    };

    private handleDelete = (fileId: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        this.props.filesStore!.deleteFile(fileId);
    };

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({editingFile: ''});
        }
    };

    private getButtons = (key: string, name: string) => (
        <div className={styles.toolButtons}>
            <div className="download-12-basic-600" onClick={this.handleDownload(key)}/>
            <div className="edit-12-basic-600" onClick={this.handleEdit(key)}/>
            <DeleteConfirm align={{offset: [-34, 0]}} type="file" name={name} onDelete={this.handleDelete(key)}>
                <div className="delete-12-basic-600" onClick={e => e.stopPropagation()}/>
            </DeleteConfirm>
        </div>
    );

    private createMenuItemForFile = (file: TFile, className?: string) => (
        <MenuItem key={file.id} onClick={this.handleOpen(file.id)}>
            {this.state.editingFile === file.id
                ? (<>
                    {this.getFileIcon(file)}
                    <input
                        onChange={(e) => {
                            this.handleRename(file.id, e.target.value);
                        }}
                        onBlur={() => this.setState({editingFile: ''})}
                        value={file.name}
                        readOnly={false}
                        onFocus={this.handleFocus}
                        autoFocus={true}
                        onKeyDown={(e) => this.handleEnter(e)}
                    />
                </>)
                : <>
                    {this.getFileIcon(file)}
                    <div className={classNames(className, styles.fileName)}>{file.name}</div>
                    {!file.readonly && this.getButtons(file.id, file.name)}
                </>
            }

        </MenuItem>
    );

    private getFileMenu = (type: string, name: string, files: TFile[]) => {
        const filesList = files.filter(file => file.type === type)
            .map(file => this.createMenuItemForFile(file));
        return <SubMenu key={type} title={<span>{name}</span>}>
            {filesList.length > 0 ? filesList : <Placeholder/>}
        </SubMenu>;
    };


    private getExamplesMenu = (libraryContent: TFolder[]) => {
        const renderItem = (item: TFile | TFolder, depth: number) => isFolder(item)
            ?
            <SubMenu key={'Samples' + item.name}
                     className={styles.folder}
                     expandIcon={<i className={'rc-menu-submenu-arrow'} style={{left: (16 * depth)}}/>}
                     title={<>
                         <div className="folder-16-basic-600"/>
                         {item.name}</>}
            >
                {item.content.map((folder) => renderItem(folder, depth + 1))}
            </SubMenu>
            :
            this.createMenuItemForFile(item, styles.exampleFile);

        return libraryContent.map((item) => renderItem(item, 1));
    };

    render() {
        const {
            filesStore,
            tabsStore,
        } = this.props;


        const files = filesStore!.files;
        const libraryContent = filesStore!.examples.folders;
        const activeTab = tabsStore!.activeTab;
        const selectedKeys = activeTab && activeTab.type === TAB_TYPE.EDITOR ? [activeTab.fileId] : [];
        return (
            <Scrollbar className={styles.root} suppressScrollX={true}>
                <div>
                    <Menu
                        mode="inline"
                        selectedKeys={selectedKeys}
                        defaultOpenKeys={[FILE_TYPE.RIDE]}
                        inlineIndent={16}
                    >
                        {this.getFileMenu(FILE_TYPE.RIDE, 'Ride files', files)}
                        {this.getFileMenu(FILE_TYPE.JAVA_SCRIPT, 'Test files', files)}
                        <SubMenu title={<span>Library</span>}>
                            <SubMenu key={'Tutorials'}
                                     expandIcon={<i className={'rc-menu-submenu-arrow'} style={{left: 16}} />}
                                     title={<>
                                         <div className="folder-16-basic-600"/>
                                         Tutorials
                                     </>}
                            >
                                <MenuItem onClick={this.handleOpenWelcomePage}>
                                    <div className="systemdoc-16-basic-600"/>
                                    <div className={classNames(styles.exampleFile, styles.fileName)}>Welcome Page</div>
                                </MenuItem>
                                <MenuItem onClick={this.handleOpenKeyboardShortcutsPage}>
                                    <div className="systemdoc-16-basic-600"/>
                                    <div className={classNames(styles.exampleFile, styles.fileName)}>Keyboard
                                        shortcuts
                                    </div>
                                </MenuItem>
                            </SubMenu>
                            {this.getExamplesMenu(libraryContent)}
                        </SubMenu>
                    </Menu>
                </div>
            </Scrollbar>
        );
    }
}


const Placeholder = () =>
    <div className={styles.placeholder}>No files yet. Please, click plus below to add new file</div>;

export default Explorer;
