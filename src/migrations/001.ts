export const VERSION = 1;

export function migrate(oldState: any) {
    return {
        ...oldState,
        filesStore: {
            files: oldState.filesStore.files.map((file: any) => ({...file, type: file.type === 'test' ? 'js' : 'ride'}))
        }
    };
}