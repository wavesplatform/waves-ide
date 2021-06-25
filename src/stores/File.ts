import getJSFileInfo, { IJSFileInfo } from '@utils/jsFileInfo';
import { autorun, Lambda, observable, reaction, runInAction } from 'mobx';
import { IDBPDatabase } from 'idb';
import { IAppDBSchema } from '@services/db';
import rideLanguageService,{ IRideFileInfo } from '@services/rideLanguageService';

export enum FILE_TYPE {
    RIDE = 'ride',
    JAVA_SCRIPT = 'js',
    MARKDOWN = 'md',
}

export interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
    readonly?: boolean
    dispose?: () => void
    delete?: () => Promise<void>
}

export interface IRideFile extends IFile {
    type: FILE_TYPE.RIDE
    readonly info: IRideFileInfo
    setInfo: (info: IRideFileInfo) => void;
}

export interface IJSFile extends IFile {
    type: FILE_TYPE.JAVA_SCRIPT
    readonly info: IJSFileInfo;
}

export interface IMDFile extends IFile {
    type: FILE_TYPE.MARKDOWN
}

export type TFile = IRideFile | IJSFile | IMDFile;

export class File implements IFile {
    @observable id: string;
    @observable content: string;
    @observable name: string;
    @observable readonly?: boolean;
    type: FILE_TYPE;
    _dbSyncDisposer?: Lambda;

    constructor(opts: IFile, private db?: IDBPDatabase<IAppDBSchema>) {
        this.id = opts.id;
        this.content = opts.content;
        this.name = opts.name;
        this.readonly = opts.readonly;
        this.type = opts.type;
        if (db) {
            this._dbSyncDisposer = reaction(() => this.toJSON(),
                file => db.put('files', file)
                    .catch(e => {
                        console.error(`Failed to save file ${file.id}`);
                        console.error(e);
                    }),
                {delay: 1000, fireImmediately: false});
        }
    }

    dispose() {
        this._dbSyncDisposer && this._dbSyncDisposer();
    }

    delete(): Promise<void> {
        this.dispose();
        return this.db
            ? this.db.delete('files', this.id).catch(e => {
                console.error(`Failed to delete file ${this.id}`);
                console.error(e);
            })
            : Promise.resolve();
    }

    toJSON(): Omit<IFile, 'info'> {
        const {id, content, type, name} = this;
        return {id, content, type, name};
    }
}


export class JSFile extends File implements IJSFile {
    @observable info: IJSFileInfo = {compilation: {error: 'No data'}, parsingResult: []};
    type: FILE_TYPE.JAVA_SCRIPT = FILE_TYPE.JAVA_SCRIPT;
    _jsFileInfoSyncDisposer: Lambda;

    constructor(opts: Omit<IJSFile, 'info'>, db?: IDBPDatabase<IAppDBSchema>) {
        super(opts, db);
        this._jsFileInfoSyncDisposer = autorun(async () => {
            const info = await getJSFileInfo(this.content);
            runInAction(() => this.info = info);
        });
    }

    dispose() {
        super.dispose();
        this._jsFileInfoSyncDisposer();
    }
}

export class RideFile extends File implements IRideFile {
    @observable info: IRideFileInfo = {
        stdLibVersion: 2,
        type: 'account',
        maxSize: 0,
        maxComplexity: 0,
        maxCallableComplexity: 0,
        compilation: {
            error: 'No data'
        },
        maxAccountVerifierComplexity: 0,
        scriptType: 0,
        contentType: 0
    };
    type: FILE_TYPE.RIDE = FILE_TYPE.RIDE;
    _rideFileInfoSyncDisposer: Lambda;

    constructor(opts: Omit<IRideFile, 'info'>, db?: IDBPDatabase<IAppDBSchema>) {
        super(opts, db);
        this._rideFileInfoSyncDisposer = autorun(async () => {
            const info = await rideLanguageService.provideInfo(this.content);
            runInAction(() => this.info = info);
        });
    }

    setInfo(info: IRideFileInfo) {
        this.info = info;
    }

    dispose() {
        super.dispose();
        this._rideFileInfoSyncDisposer();
    }
}
