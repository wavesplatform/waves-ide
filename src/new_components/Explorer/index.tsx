import React from 'react';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, FilesStore, IFile, TAB_TYPE, TabsStore, TFile } from '@stores';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Menu, { MenuItem, SubMenu } from 'rc-menu';
import Popover from 'rc-tooltip';
import { UserDialog } from '@components/UserDialog';
import styles from './styles.less';

interface IExampleType {
    name: string,
    dir: string
    content: string
}

const examples: Record<string, IExampleType[]> = require('../../gitExamples.json');

type TLibFile = { fileType: 'tutorials' | 'smart-accounts' | 'smart-assets', name: string };

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

    private getFileIcon = (file: TFile) => {
        let icon = <div className="systemdoc-16-basic-600"/>;
        if (file.type === FILE_TYPE.RIDE) {
            switch (file.info.type) {
                case 'account':
                    icon = <div className="accountdoc-16-basic-600"/>;
                    break;
                case 'asset':
                    icon = <div className="assetdoc-16-basic-600"/>;
                    break;
                case 'dApp':
                    icon = <div className="systemdoc-16-basic-600"/>;
                    break;
            }
        } else if (file.type === FILE_TYPE.JAVA_SCRIPT) {
            icon = <div className="systemdoc-16-basic-600"/>;
        }
        return icon;
    };
    private getLibFileIcon = (file: TLibFile) => {
        let icon = <div className="systemdoc-16-basic-600"/>;
        switch (file.fileType) {
            case 'smart-accounts':
                icon = <div className="accountdoc-16-basic-600"/>;
                break;
            case 'smart-assets':
                icon = <div className="assetdoc-16-basic-600"/>;
                break;
            case 'tutorials':
                icon = <div className="systemdoc-16-basic-600"/>;
                break;
        }
        return icon;
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

    private handleLoadExample = (type: string, name: string, content: string) => {
        this.props.filesStore!.createFile({type: FILE_TYPE.RIDE, name, content}, true);
    };
    private getButtons = (key: string, name: string) => (
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <div className="edit-12-basic-600" onClick={() => this.setState({editingTab: key})}/>
            </Popover>
            <Popover
                trigger="click"
                placement="bottom"
                overlay={
                    <div>
                        <p>Are you sure you want to delete&nbsp;<b>{name}</b>&nbsp;?</p>
                        <button className={styles.deleteButton}
                                onClick={() => this.props.filesStore!.deleteFile(key)}>
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="delete-12-basic-600"/>
            </Popover>
        </div>
    );

    private createMenuItem = (file: TFile) => (
        <MenuItem key={file.id} onClick={this.handleOpen(file.id)}>
            {this.state.editingTab === file.id
                ? (<>
                    {this.getFileIcon(file)}
                    <input
                        onChange={(e) => {
                            this.handleRename(file.id, e.target.value);
                        }}
                        onBlur={() => this.setState({editingTab: ''})}
                        value={file.name}
                        readOnly={false}
                        onFocus={this.handleFocus}
                        autoFocus={true}
                        onKeyDown={(e) => this.handleEnter(e)}
                    />
                </>)
                : <>
                    {this.getFileIcon(file)}
                    <div className={styles.fileName}>{file.name}</div>
                    {this.getButtons(file.id, file.name)}
                </>
            }

        </MenuItem>
    );

    private getFileMenu = (type: string, name: string, files: TFile[]) =>
        <SubMenu key={type} title={<span>{name}</span>}>
            {files.filter(file => file.type === type).map(file => this.createMenuItem(file))}
        </SubMenu>;

    private getLibMenu = (key: string, name: string, children: TLibFile[]) => (
        <SubMenu key={key} title={<span>{name}</span>}>
            {(children).map(file =>
                <SubMenu key={file.fileType}
                         title={<>
                             <div className="folder-16-basic-600"/>
                             {file.name}</>}
                >{
                    examples[file.fileType] && examples[file.fileType].map(
                        ({name, dir, content}: IExampleType, i) =>
                            <MenuItem key={i} onClick={() => this.handleLoadExample(file.fileType, name, content)}>
                                {this.getLibFileIcon(file)}{name}
                            </MenuItem>
                    )
                }</SubMenu>
            )}
        </SubMenu>
    );

    render() {
        const {
            filesStore,
            tabsStore
        } = this.props;


        const files = filesStore!.files;


        const activeTab = tabsStore!.activeTab;
        const selectedKeys = activeTab && activeTab.type === TAB_TYPE.EDITOR ? [activeTab.fileId] : [];
        return (
            <PerfectScrollbar className={styles.root} option={{suppressScrollX: true}}>
                <div>
                    <Menu
                        mode="inline"
                        selectedKeys={selectedKeys}
                        defaultOpenKeys={[FILE_TYPE.RIDE]}
                    >
                        {this.getFileMenu(FILE_TYPE.RIDE, 'Your files', files)}
                        {this.getLibMenu('library', 'Library', [
                            {fileType: 'tutorials', name: 'Tutorials'},
                            {fileType: 'smart-accounts', name: 'Samples smart-accounts'},
                            {fileType: 'smart-assets', name: 'Samples smart-assets'}]
                        )}
                        {this.getFileMenu(FILE_TYPE.JAVA_SCRIPT, 'Tests', files)}
                    </Menu>
                </div>
            </PerfectScrollbar>
        );
    }
}

export default Explorer;
