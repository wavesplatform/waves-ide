import { openDB, IDBPDatabase, } from 'idb';
import { FILE_TYPE, IFile } from '@stores/FilesStore';
import { DBSchema, IDBPTransaction } from 'idb/lib/entry';
import { range } from '@utils/range';

export interface IAppDBSchema extends DBSchema {
    files: {
        key: string
        value: {
            id: string
            name: string
            content: string
            type: FILE_TYPE
        }
    }
}

async function setupDB() {
    const db = await openDB<IAppDBSchema>('AppDatabase', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            range(oldVersion, newVersion || 0).forEach(v => upgrades[v](db, transaction));
        },
        blocked() {
            alert('Database update failed, please close all other app tabs and reload the page');
        },
        blocking() {
            db.close();
            alert('Database is outdated, please reload the page.');
        },
    });
    return db;
}

type TUpgrader = (database: IDBPDatabase<IAppDBSchema>, transaction: IDBPTransaction<IAppDBSchema>) => void;

const upgrades: TUpgrader[] = [
    // Initial setup v0 -> v1
    (db, transaction) => {
        db.createObjectStore('files', {keyPath: 'id'});
        const filesStr = localStorage.getItem('filesBackup');
        if (filesStr) {
            const files: IFile[] = JSON.parse(filesStr);
            files.forEach(file => transaction.objectStore('files').put(file));
        }

    }
];

const dbPromise = setupDB();
export default dbPromise;
