import rideFileInfo, { IRideFileInfo } from '@utils/rideFileInfo';
import getJSFileInfo, { IJSFileInfo } from '@utils/jsFileInfo';
import { autorun, Lambda, observable, runInAction } from 'mobx';
import { IDBPDatabase } from 'idb';

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
}

export interface IRideFile extends IFile {
    type: FILE_TYPE.RIDE
    readonly info: IRideFileInfo
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

    constructor(opts: IFile, private db?: IDBPDatabase) {
        this.id = opts.id;
        this.content = opts.content;
        this.name = opts.name;
        this.readonly = opts.readonly;
        this.type = opts.type;
    }

    dispose() {
        this.db && this.db.delete('files', this.id);
    }

    toJSON() {
        return Object.entries(this).filter(([k, _]) => k.startsWith('_'))
            .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});
    }
}

export class RideFile extends File implements IRideFile{
    type: FILE_TYPE.RIDE = FILE_TYPE.RIDE;

    constructor(opts: IRideFile, db?: IDBPDatabase) {
        super(opts, db);
    }

    get info() {
        return rideFileInfo(this.content);
    }
}

export class JSFile extends File implements IJSFile{
    @observable info: IJSFileInfo = {compilation: {error: 'No data'}, parsingResult: []};
    type: FILE_TYPE.JAVA_SCRIPT = FILE_TYPE.JAVA_SCRIPT;
    _disposeSubscription: Lambda;

    constructor(opts: IJSFile, db?: IDBPDatabase) {
        super(opts, db);
        this._disposeSubscription = autorun(async () => {
            const info = await getJSFileInfo(this.content);
            runInAction(() => this.info = info);
        });
    }

    dispose() {
        super.dispose();
        this._disposeSubscription();
    }
}

