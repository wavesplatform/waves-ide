import { observable, action, computed, runInAction, flow, autorun } from 'mobx';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { TAB_TYPE } from '@stores/TabsStore';

import rideFileInfo, { IRideFileInfo } from '@utils/rideFileInfo';
import getJSFileInfo, { IJSFileInfo } from '@utils/jsFileInfo';
import { debounce } from 'debounce';

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

type TFile = IRideFile | IJSFile;


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
    } else {
        return observable({
            id: file.id,
            type: file.type,
            name: file.name,
            content: file.content,

            get info() {
                return rideFileInfo(this.content);
            }
        });
    }
}

type TWithHash = { sha: string };

class FilesStore extends SubStore {
    @observable files: TFile[] = [];

    @observable examples = {
        eTag: '',
        categories: {
            'smart-accounts': {
                sha: '',
                files: [] as (IRideFile & TWithHash)[]
            },
            'ride4dapps': {
                sha: '',
                files: [] as (IRideFile & TWithHash)[]
            },
            'smart-assets': {
                sha: '',
                files: [] as (IRideFile & TWithHash)[]
            },
        }
    };

    public currentDebouncedChangeFnForFile?: ReturnType<typeof debounce>;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.files = initState.files.map(fileObs);
            this.examples = observable(Object.assign(this.examples, initState.examples));
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
            file = this.files.find(file => file.name === fileName);

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
                .filter(l => l.startsWith(type.toString()))
                .map(x => parseInt(x.replace(type + '_', '')) || 0),
            0
        );
        return type + '_' + (maxIndex + 1);
    }

    get flatExamples() {
        return Object.values(this.examples.categories).reduce((acc, {files}) => acc.concat(files), [] as TFile[]);
    }

    fileById(id: string) {
        return this.files.find(file => file.id === id) || this.flatExamples.find(file => file.id === id);
    }

    // FixMe: readonly is already optional but typescript throws error without adding it to overwrite
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

        for (let [category, entry] of Object.entries(this.examples.categories)) {
            let {sha, files} = entry;
            const categoryInfo = repoInfoResp.data.find((catInfo: any) => catInfo.name === category);

            if (!categoryInfo || categoryInfo.sha === sha) continue;

            const filesInfoResp = await axios.get(apiEndpoint + category, {validateStatus: () => true});

            if (filesInfoResp.status !== 200) continue;

            const fileInfoArr = filesInfoResp.data;

            const updatedFiles: (IRideFile & TWithHash)[] = [];
            for (let fileInfo of fileInfoArr) {
                const file = files.find(file => fileInfo.name === file.id);
                if (!file || file.sha !== fileInfo.sha) {
                    const content = await axios.get(fileInfo.download_url)
                        .then(resp => resp.data);
                    updatedFiles.push({
                        name: fileInfo.name,
                        content: content,
                        type: FILE_TYPE.RIDE as FILE_TYPE.RIDE,
                        id: fileInfo.name,
                        sha: fileInfo.sha,
                        readonly: true,
                        info: rideFileInfo(content)
                    });
                } else {
                    updatedFiles.push(file);
                }
            }

            runInAction(() => {
                entry.sha = categoryInfo.sha;
                entry.files = updatedFiles;
            });

        }
        runInAction(() => {
            this.examples.eTag = repoInfoResp.headers.etag;
        });
    }


}

export {
    FilesStore,
    FILE_TYPE,
    IFile,
    IRideFile,
    IJSFile,
    TFile
};


