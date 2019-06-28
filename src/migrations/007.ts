export const VERSION = 7;

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
