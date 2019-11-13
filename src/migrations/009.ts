export const VERSION = 9;

export function migrate(oldState: any) {
    const files = oldState.filesStore.files;
    if (files){
        localStorage.setItem('filesBackup', JSON.stringify(files));
    }
    return oldState;
}
