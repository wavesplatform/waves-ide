import { openDB, deleteDB, wrap, unwrap, IDBPDatabase, } from 'idb';
import { loadState } from '@utils/localStore';
import { IFile } from '@stores/FilesStore';
import migrators from '@src/migrations';
import { DBSchema, IDBPTransaction } from 'idb/lib/entry';
import { range } from '@utils/range';

async function setupDB() {
    const db = await openDB('AppDatabase', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            range(oldVersion, newVersion || 0).forEach(v => upgrages[v](db, transaction));
        },
        blocked() {
            // …
        },
        blocking() {
            // …
        },
    });
    // window.db = db;
    return db;
}

type TUpgrader = (database: IDBPDatabase<unknown>, transaction: IDBPTransaction<unknown, string[]>) => void;
const upgrages: TUpgrader[] = [
    // Initial setup
    (db, transaction) => {
        let initState = loadState();
        db.createObjectStore('files', {keyPath: 'id'});
        db.createObjectStore('accounts', {keyPath: ['seed', 'chainId']});
        if (!initState) return;
        if (initState.VERSION !== 8) {
            initState = migrators.slice(initState.VERSION, 9)
                .reduce((acc, migrator) => migrator.migrate(acc), initState);
        }
        const files: IFile[] = initState.filesStore.files;
        files.forEach(file => transaction.objectStore('files').put(file));
    }
];
export = setupDB();
