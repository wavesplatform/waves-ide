import { observable, action, computed } from 'mobx';
import { v4 as uuid } from 'uuid';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

import { TAB_TYPE } from '@stores/TabsStore';
import rideFileInfo, { IRideFileInfo } from '@utils/rideFileInfo';

type Overwrite<T1, T2> = {
    [P in Exclude<keyof T1, keyof T2>]: T1[P]
} & T2;

enum FILE_TYPE {
    RIDE = 'ride',
    JAVA_SCRIPT = 'js',
}

interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
}

interface IRideFile extends IFile{
    type: FILE_TYPE.RIDE
    readonly info: IRideFileInfo
}

interface ITestFile extends IFile{
    type: FILE_TYPE.JAVA_SCRIPT
    readonly info: null;
}

const isAccountScript = (file: IFile): file is IRideFile =>
    (file.type === FILE_TYPE.RIDE && (file as IRideFile).info.type === 'account');
const isAssetScript = (file: IFile): file is IRideFile =>
    (file.type === FILE_TYPE.RIDE && (file as IRideFile).info.type === 'asset');
const isDApp = (file: IFile): file is IRideFile =>
    (file.type === FILE_TYPE.RIDE && (file as IRideFile).info.type === 'dApp');
const isTestScript = (file: IFile): file is ITestFile => (file.type === FILE_TYPE.JAVA_SCRIPT);

type TFile = IRideFile | ITestFile;

function fileObs(file: IFile): TFile{
    return observable({
        id: file.id,
        type: file.type,
        name: file.name,
        content: file.content,
        get info(){
            if (this.type === FILE_TYPE.RIDE){
                return rideFileInfo(this.content);
            }else return null;
        }
    }) as TFile;
}
class FilesStore extends SubStore {
    @observable files: TFile[] = [];

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.files = initState.files.map(fileObs);
        }
    }

    @computed
    get currentFile() {

        const activeTab = this.rootStore.tabsStore.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR) {
            return this.files.find(file => file.id === activeTab.fileId);
        } else return;
    }

    private generateFilename(type: FILE_TYPE) {
        let maxIndex = Math.max(...this.files.filter(file => file.type === type).map(n => n.name)
                .filter(l => l.startsWith(type.toString()))
                .map(x => parseInt(x.replace(type + '_', '')) || 0),
            0
        );
        return type + '_' + (maxIndex + 1);
    }

    fileById(id: string) {
        return this.files.find(file => file.id === id);
    }

    @action
    createFile(file: Overwrite<IFile, { id?: string, name?: string }>, open = false) {
        const newFile = fileObs({
            id: uuid(),
            name: this.generateFilename(file.type),
            ...file
        });
        if (this.files.some(file => file.id === newFile.id)) {
            throw new Error(`Duplicate identifier ${newFile.id}`);
        }
        this.files.push(newFile);
        if (open) {
            this.rootStore.tabsStore.openFile(newFile.id);
        }
        return newFile;
    }

    @action
    deleteFile(id: string) {
        const i = this.files.findIndex(file => file.id === id);
        if (i > -1) this.files.splice(i, 1);

        // if deleted file was opened in active tab close tab
        const tabsStore = this.rootStore.tabsStore;
        const activeTab = tabsStore.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR && activeTab.fileId === id) {
            tabsStore.closeTab(tabsStore.activeTabIndex);
        }
    }

    @action
    changeFileContent(id: string, newContent: string) {
        const file = this.fileById(id);
        if (file != null) file.content = newContent;
    }

    @action
    renameFile(id: string, newName: string) {
        const file = this.fileById(id);
        if (file != null) file.name = newName;
    }
}

export {
    FilesStore,
    FILE_TYPE,
    IFile,
    IRideFile,
    ITestFile,
    TFile,
    isAccountScript,
    isAssetScript,
    isDApp,
    isTestScript,
};
