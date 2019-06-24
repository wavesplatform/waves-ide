export const VERSION = 5;

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
