export const VERSION = 4;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        filesStore: {
            ...oldState.filesStore,
            examples: null
        }
    };

    return newState;
}
