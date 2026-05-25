import { action, computed, IObservableArray, makeObservable, observable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { TAB_TYPE } from '@stores/TabsStore';

import getJSFileInfo from '@utils/jsFileInfo';
import debounce from 'debounce';
import { testSamples } from '@src/testSamples';
import dbPromise, { IAppDBSchema } from '@services/db';
import { IDBPDatabase } from 'idb';
import { FILE_TYPE, IFile, IJSFile, IRideFile, JSFile, RideFile, TFile } from './File';
import rideLanguageService from '@services/rideLanguageService';
import { scriptInfo } from '@waves/ride-js';

const FOLDERS = ['smart-accounts', 'smart-assets', 'dApps', 'dApp-to-dApps', 'casino', 'auction'];

type TFolder = {
    name: string,
    sha: string,
    content: (TSampleFile | TFolder)[]
};

type TGithubDataItem = {
    download_url: string
    git_url: string
    html_url: string
    name: string
    path: string
    sha: string
    size: number
    type: 'file' | 'dir'
    url: string
};

interface IFileCreateData extends IFileEventData {
    type: 'create';
    id: string;
}

interface IFileUpdateData extends IFileEventData {
    type: 'update';
    id: string;
    content: string;
}

interface IFileDeleteData extends IFileEventData {
    type: 'delete';
    id: string;
}

interface IRenameFileData extends IFileEventData {
    type: 'rename';
    id: string;
    name: string;
}

const isFolder = (obj: TFile | TFolder): obj is TFolder => Array.isArray(obj.content);

type TSampleFile = TFile & { sha: string, readonly: true };

function isRideFile(file: TFile): file is RideFile {
    return file.type === FILE_TYPE.RIDE &&
        typeof (file as any).setInfo === 'function';
}

class FilesStore extends SubStore {

    public initPromise: Promise<void>;

    @observable files: IObservableArray<TFile> = observable.array([]);
    @observable examples = {
        eTag: '',
        folders: [] as TFolder[]
    };

    tests: TFolder = {
        name: 'Tests',
        sha: '',
        content: [
            new JSFile({
                id: 'Basic-test-sample',
                name: 'Basic sample',
                type: FILE_TYPE.JAVA_SCRIPT,
                content: testSamples.basic,
                readonly: true
            }) as any
        ]
    };

    private bc?: BroadcastChannel;
    private _preventUpdateMessage = false;
    public currentDebouncedChangeFnForFile?: ReturnType<typeof debounce>;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        makeObservable(this);

        if (initState != null) {
            this.examples = observable(Object.assign(this.examples, initState.examples));
            this.examples.folders[this.examples.folders.length - 1] = this.tests;
            this.updateExamples().catch(e => console.error(`Error: ${e}`));
        } else {
            this._initExamples()
                .then(() => this.updateExamples())
                .catch(e => console.error(`Error: ${e}`));
        }

        if ('BroadcastChannel' in window) {
            this.bc = new BroadcastChannel('file_events_channel');
            this.bc.addEventListener('message', this.handleChannelMessage.bind(this));
        }

        let resolveInitPromise: () => void;
        this.initPromise = new Promise<void>(resolve => resolveInitPromise = resolve);
        this.syncFilesWithDb().then(() => resolveInitPromise());
    }

    fileObs(file: IFile, db?: IDBPDatabase<IAppDBSchema>): RideFile | JSFile {
        if (file.type === FILE_TYPE.JAVA_SCRIPT) {
            return new JSFile(file as IJSFile, db);
        } else if (file.type === FILE_TYPE.RIDE) {
            return new RideFile(this.rootStore.settingsStore, file as IRideFile, db);
        }
        throw new Error(`Invalid file type ${file.type}`);
    }

    public serialize = () => ({ examples: this.examples });

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

        if (activeTab && activeTab.type === TAB_TYPE.EDITOR && 'fileId' in activeTab) {
            return this.fileById(activeTab.fileId);
        }
        return;
    }

    private generateFilename(type: FILE_TYPE) {
        let maxIndex = Math.max(...this.files.filter(file => file.type === type).map(n => n.name)
            .filter(l => l.startsWith('file_'))
            .map(x => parseInt(x.split('.')[0].replace('file_', '')) || 0), 0);
        return `file_${maxIndex + 1}.${type}`;
    }

    get flatExamples() {
        const flattenContent = (content: (TFolder | TFile)[]): TFile[] => {
            return content.reduce((acc, item) => acc.concat(isFolder(item) ? flattenContent(item.content) : item), [] as TFile[]);
        };
        return flattenContent(this.examples.folders);
    }

    fileById(id: string) {
        return [...this.files, ...this.flatExamples].find(file => file.id === id);
    }

    @action
    async createFile(file: Partial<IFile> & { type: FILE_TYPE, content: string }, open = false): Promise<TFile> {
        const db = await dbPromise;
        const newFile = this.fileObs({ id: uuid(), name: this.generateFilename(file.type), ...file }, db);

        if (this.files.some(f => f.id === newFile.id)) {
            throw new Error(`Duplicate identifier ${newFile.id}`);
        }

        runInAction(() => this.files.push(newFile));

        if (open) {
            this.rootStore.tabsStore.openFile(newFile.id);
        }

        await db.add('files', newFile.toJSON());
        this.bc?.postMessage({ type: 'create', id: newFile.id });
        return newFile;
    }

    @action
    deleteFile(id: string) {
        const i = this.files.findIndex(file => file.id === id);
        if (i === -1) {
            console.error(`Failed to delete file with id:${id}. File not found`);
            return;
        }
        const file = this.files.splice(i, 1)[0];
        file.delete?.().then(() => this.bc?.postMessage({ type: 'delete', id: file.id }));

        const deletedFileTabIndex = this.rootStore.tabsStore.tabs
            .findIndex(tab => tab.type === TAB_TYPE.EDITOR && tab.fileId === id);

        if (deletedFileTabIndex > -1) {
            this.rootStore.tabsStore.closeTab(deletedFileTabIndex);
        }
    }

    @action
    changeFileContent(id: string, newContent: string) {
        const file = this.fileById(id);
        if (file != null) {
            file.content = newContent;
            if (file.type === FILE_TYPE.RIDE && this.currentFile?.id === file.id) {
                void this.syncCurrentFileInfo(file.isCompaction, file.isRemoveUnusedCode);
            }
            if (!this._preventUpdateMessage) {
                this.bc?.postMessage({ type: 'update', id: file.id, content: file.content });
            } else {
                this._preventUpdateMessage = false;
            }
        }
    }


    async syncCurrentFileInfo(isCompaction?: boolean, isRemoveUnusedCode?: boolean) {
        const file = this.currentFile;
        if (!file || !isRideFile(file)) return;

        let libraries: Record<string, string> = {};
        const rideFileInfo = scriptInfo(file.content);

        if (!('error' in rideFileInfo) && rideFileInfo.imports?.length) {
            const db = await dbPromise;
            const files = await db?.getAll('files') || [];
            const imports = rideFileInfo.imports.map((name: string) => name.endsWith('.ride') ? name : `${name}.ride`);

            files.forEach(f => {
                if (imports.includes(f.name)) {
                    const libName = rideFileInfo.imports.find((name: string) => name === f.name || `${name}.ride` === f.name);
                    if (libName) libraries[libName] = f.content;
                }
            });
        }

        const info = await rideLanguageService.provideInfo(file.content, isCompaction, isRemoveUnusedCode, libraries);
        file.setInfo(info);
    }

    getDebouncedChangeFnForFile = (id: string) => {
        const changeFileFn = debounce((newContent: string) => this.changeFileContent(id, newContent), 500);
        this.currentDebouncedChangeFnForFile = changeFileFn;
        return changeFileFn;
    };

    @action
    renameFile(id: string, newName: string) {
        const file = this.fileById(id);
        if (file && file.name !== newName) {
            file.name = newName;
            this.bc?.postMessage({ type: 'rename', id: file.id, name: newName });
        }
    }

    @action
    private async updateExamples() {
        const apiEndpoint = 'https://api.github.com/repos/wavesplatform/ride-examples/contents/';
        const repoInfoResp = await axios.get<TGithubDataItem[]>(apiEndpoint, {
            headers: { 'If-None-Match': this.examples.eTag },
            validateStatus: () => true
        });

        if (repoInfoResp.status !== 200) {
            if (repoInfoResp.status !== 304) console.error('Failed to get examples repository info');
            return;
        }

        const foldersToSync = repoInfoResp.data.filter(item => FOLDERS.includes(item.name));
        const updatedContent = await this.syncContent(this.examples.folders, foldersToSync);
        updatedContent.push(this.tests as TFolder);

        runInAction(() => {
            this.examples.folders = updatedContent as TFolder[];
            this.examples.eTag = repoInfoResp.headers.etag;
        });
    }

    private async syncContent(oldContent: (TSampleFile | TFolder)[], remoteInfo: TGithubDataItem[]): Promise<(TSampleFile | TFolder)[]> {
        let resultContent: (TSampleFile | TFolder)[] = [];

        for (const remoteItem of remoteInfo) {
            const localItem = oldContent.find(item => item.sha === remoteItem.sha);
            if (localItem) {
                resultContent.push(localItem);
                continue;
            }

            if (remoteItem.type === 'file') {
                const content = await axios.get(remoteItem.download_url).then(r => r.data);
                const ext = remoteItem.name.split('.').pop() as FILE_TYPE;
                let info;

                if (ext === 'ride') {
                    const files = await dbPromise.then(db => db.getAll('files'));
                    info = await rideLanguageService.provideInfo(content, undefined, undefined, files.filter(f => f.type === FILE_TYPE.RIDE) as any);
                }
                if (ext === 'js') info = await getJSFileInfo(content);
                if (['ride', 'js', 'md'].includes(ext)) {
                    resultContent.push({
                        name: remoteItem.name,
                        content,
                        type: ext,
                        id: remoteItem.path,
                        sha: remoteItem.sha,
                        readonly: true,
                        info
                    });
                }
            } else if (remoteItem.type === 'dir') {
                const folderInfo = await axios.get(remoteItem.url).then(r => r.data);
                const localFolder = oldContent.find(item => item.name === remoteItem.name);
                const localContent = localFolder && Array.isArray(localFolder.content) ? localFolder.content : [];
                resultContent.push({
                    name: remoteItem.name,
                    sha: remoteItem.sha,
                    content: await this.syncContent(localContent, folderInfo)
                });
            }
        }
        return resultContent;
    }

    @action
    private async _initExamples() {
        const provideInfo = async (item: TFolder | TSampleFile): Promise<TFolder | TSampleFile> => {
            if (isFolder(item)) {
                return { ...item, content: await Promise.all(item.content.map(provideInfo)) };
            }
            if (item.type === FILE_TYPE.JAVA_SCRIPT) {
                return { ...item, info: await getJSFileInfo(item.content) };
            }
            if (item.type === FILE_TYPE.RIDE) {
                return { ...item, info: await rideLanguageService.provideInfo(item.content) };
            }
            return item;
        };

        const examples = require('../json-data/ride-examples.json');
        const withInfo = { ...examples, folders: await Promise.all(examples.folders.map(provideInfo)) };
        this.examples = observable(withInfo);
        this.examples.folders[this.examples.folders.length] = this.tests;
    }

    @action
    private handleChannelMessage = (e: { data: TFileEventData }) => {
        const { data } = e;
        if (!data) return;

        switch (data.type) {
            case 'update': {
                const updateData = data as IFileUpdateData;
                const file = this.fileById(updateData.id);
                if (file) {
                    file.content = updateData.content;
                }
                break;
            }
            case 'rename': {
                const renameData = data as IRenameFileData;
                const f = this.fileById(renameData.id);
                if (f) f.name = renameData.name;
                break;
            }
            case 'delete': {
                const deleteData = data as IFileDeleteData;
                this.deleteFile(deleteData.id);
                break;
            }
            case 'create': {
                const createData = data as IFileCreateData;
                dbPromise.then(db => db.get('files', createData.id))
                    .then(file => { if (file) runInAction(() => this.files.push(this.fileObs(file))); });
                break;
            }
        }
    };

    @action
    private syncFilesWithDb = async (): Promise<void> => {
        this.files.forEach(f => f.dispose?.());
        const db = await dbPromise;
        const files = await db.getAll('files');
        const newFiles = files.map(file => this.fileObs(file, db));

        runInAction(() => {
            this.files.clear();
            this.files.push(...newFiles);
        });
    };
}

interface IFileEventData {
    type: 'create' | 'update' | 'delete' | 'rename';
    id: string
}

type TFileEventData = IFileEventData;

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
