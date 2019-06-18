import { action, autorun, computed, observable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { TAB_TYPE } from '@stores/TabsStore';

import rideFileInfo, { IRideFileInfo } from '@utils/rideFileInfo';
import getJSFileInfo, { IJSFileInfo } from '@utils/jsFileInfo';
import { debounce } from 'debounce';
import { testSamples } from '../testSamples';

export type Overwrite<T1, T2> = {
    [P in Exclude<keyof T1, keyof T2>]: T1[P]
} & T2;

enum FILE_TYPE {
    RIDE = 'ride',
    JAVA_SCRIPT = 'js',
    MARKDOWN = 'md',
}

interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
    readonly?: boolean
}

interface IRideFile extends IFile {
    type: FILE_TYPE.RIDE
    readonly info: IRideFileInfo
}

interface IJSFile extends IFile {
    type: FILE_TYPE.JAVA_SCRIPT
    readonly info: IJSFileInfo;
}

interface IMDFile extends IFile {
    type: FILE_TYPE.MARKDOWN
}

type TFile = IRideFile | IJSFile | IMDFile;


class JSFile implements IJSFile {
    @observable id: string;
    @observable content: string;
    @observable name: string;
    @observable readonly?: boolean;
    type: FILE_TYPE.JAVA_SCRIPT = FILE_TYPE.JAVA_SCRIPT;

    @observable info: IJSFileInfo = {compilation: {error: 'No data'}};

    constructor(opts: IFile) {
        this.id = opts.id;
        this.content = opts.content;
        this.name = opts.name;
        this.readonly = opts.readonly;

        autorun(async () => {
            const info = await getJSFileInfo(this.content);
            runInAction(() => this.info = info);
        });
    }

    toJSON() {
        return Object.entries(this).filter(([k, _]) => k !== '_info')
            .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});
    }
}

function fileObs(file: IFile): TFile {
    if (file.type === FILE_TYPE.JAVA_SCRIPT) {
        return new JSFile(file);
    } else if (file.type === FILE_TYPE.RIDE) {
        return observable({
            id: file.id,
            type: file.type,
            name: file.name,
            content: file.content,

            get info() {
                return rideFileInfo(this.content);
            }
        });
    } else {
        return observable({
            id: file.id,
            type: file.type,
            name: file.name,
            content: file.content,
        });
    }
}

const FOLDERS = ['smart-accounts', 'ride4dapps', 'smart-assets'];

type TFolder = {
    name: string,
    sha: string,
    content: (TSampleFile | TFolder)[]
};

const isFolder = (obj: TFile | TFolder): obj is TFolder => Array.isArray(obj.content);

type TSampleFile = TFile & { sha: string, readonly: true };

class FilesStore extends SubStore {

    @observable files: TFile[] = [];

    @observable examples = {
        eTag: '',
        folders: [] as TFolder[]
    };
    // Todo: This is hardcoded tests need to refactor them out to github repo
    tests: TFolder = {
        name: 'Tests',
        sha: '',
        content: [
            {
                ...new JSFile({
                    id: 'Basic-test-sample',
                    name: 'Basic sample',
                    type: FILE_TYPE.JAVA_SCRIPT,
                    content: testSamples.basic
                }), sha: '', readonly: true
            }
        ]
    };

    public currentDebouncedChangeFnForFile?: ReturnType<typeof debounce>;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.files = initState.files.map(fileObs);
            this.examples = observable(Object.assign(this.examples, initState.examples));
            // Todo: This is hardcoded tests need to refactor them out to github repo
            this.examples.folders[this.examples.folders.length - 1] = this.tests;
        }
        this.updateExamples().catch(e => console.error(`Error occurred while updating examples: ${e}`));

    }

    public serialize = () => ({
        files: this.files,
        examples: this.examples
    });


    getFileContent = (fileName?: string) => {
        let file: IFile | undefined;

        if (!fileName) {
            file = this.currentFile;

            if (file == null) throw new Error('No file opened in editor');
        } else {
            file = [...this.files, ...this.flatExamples].find(file => file.name === fileName);

            if (file == null) throw new Error(`No file with name ${fileName}`);
        }

        return file.content;
    };

    @computed
    get currentFile() {
        const activeTab = this.rootStore.tabsStore.activeTab;
        if (activeTab && activeTab.type === TAB_TYPE.EDITOR) {
            return this.fileById(activeTab.fileId);
        } else return;
    }

    private generateFilename(type: FILE_TYPE) {
        let maxIndex = Math.max(...this.files.filter(file => file.type === type).map(n => n.name)
                .filter(l => l.startsWith('file_'))
                .map(x => parseInt(x.split('.')[0].replace('file_', '')) || 0),
            0
        );
        return `file_${(maxIndex + 1)}.${type}`;
    }

    get flatExamples() {
        function flattenContent(content: (TFolder | TFile)[]): TFile[] {
            return content.reduce((acc, item) => acc.concat(isFolder(item)
                ? flattenContent(item.content)
                : item),
                [] as TFile[]
            );
        }

        return flattenContent(this.examples.folders);
    }

    fileById(id: string) {
        return [...this.files, ...this.flatExamples].find(file => file.id === id);
    }

    // FixMe: readonly is already optional but typescript throws error if i won't add it
    @action
    createFile(file: Overwrite<IFile, { id?: string, name?: string, readonly?: boolean }>, open = false) {
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
        if (i === -1) {
            console.error(`Failed to delete file with id:${id}. File not found`);
            return;
        }
        this.files.splice(i, 1);

        // if deleted file was opened in tab close tab
        const tabsStore = this.rootStore.tabsStore;
        const deletedFileTabIndex = this.rootStore.tabsStore.tabs
            .findIndex(tab => tab.type === TAB_TYPE.EDITOR && tab.fileId === id);

        if (deletedFileTabIndex > -1) {
            tabsStore.closeTab(deletedFileTabIndex);
        }
    }

    @action
    changeFileContent(id: string, newContent: string) {
        const file = this.fileById(id);
        if (file != null) file.content = newContent;
    }

    getDebouncedChangeFnForFile = (id: string) => {
        const changeFileFn = debounce((newContent: string) => this.changeFileContent(id, newContent), 2000);
        this.currentDebouncedChangeFnForFile = changeFileFn;
        return changeFileFn;
    };

    @action
    renameFile(id: string, newName: string) {
        const file = this.fileById(id);
        if (file != null) file.name = newName;
    }

    @action
    private async updateExamples() {
        const apiEndpoint = 'https://api.github.com/repos/wavesplatform/ride-examples/contents/';
        const repoInfoResp = await axios.get(apiEndpoint,
            {headers: {'If-None-Match': this.examples.eTag}, validateStatus: () => true});

        if (repoInfoResp.status !== 200) {
            // Logging
            if (repoInfoResp.status !== 304) {
                console.error('Failed to get examples repository info');
            } else {
                console.log(`Examples are up to date. Etag: ${this.examples.eTag}`);
            }
            return;
        }

        const foldersToSync = repoInfoResp.data.filter((item: any) => FOLDERS.includes(item.name));
        const updatedContent = await syncContent(this.examples.folders, foldersToSync);

        // Todo: This is hardcoded tests need to refactor them out to github repo
        updatedContent.push(this.tests as TFolder);

        runInAction(() => {
            this.examples.folders = updatedContent as TFolder[];
            this.examples.eTag = repoInfoResp.headers.etag;
        });

        async function syncContent(oldContent: (TSampleFile | TFolder)[],
                                   remoteInfo: any[]): Promise<(TSampleFile | TFolder)[]> {
            let resultContent = [];

            for (let remoteItem of remoteInfo) {
                // If content hasn't changed push local item
                const localItem = oldContent.find(item => item.sha === remoteItem.sha);
                if (localItem) {
                    resultContent.push(localItem);
                    continue;
                }

                if (remoteItem.type === 'file') {
                    const content = await axios.get(remoteItem.download_url).then(r => r.data);
                    const ext = remoteItem.name.split('.')[remoteItem.name.split('.').length - 1];
                    let info;
                    if (ext === 'ride') info = rideFileInfo(content);
                    if (ext === 'js') info = await getJSFileInfo(content);
                    resultContent.push({
                        name: remoteItem.name,
                        content,
                        type: ext,
                        id: remoteItem.path,
                        sha: remoteItem.sha,
                        readonly: true,
                        info: info
                    });
                } else if (remoteItem.type === 'dir') {
                    const folderInfo = await axios.get(remoteItem.url).then(r => r.data);
                    const localFolder = oldContent.find(item => item.name === remoteItem.name);
                    const localContent = localFolder && Array.isArray(localFolder.content) ? localFolder.content : [];
                    resultContent.push({
                        name: remoteItem.name,
                        sha: remoteItem.sha,
                        content: await syncContent(localContent, folderInfo)
                    });
                }

            }
            return resultContent;
        }
    }
}

export {
    FilesStore,
    FILE_TYPE,
    IFile,
    IRideFile,
    IJSFile,
    TFile,
    TFolder,
    isFolder
};


