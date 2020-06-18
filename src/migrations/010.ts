export const VERSION = 10;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        settingsStore: {
            ...oldState.settingsStore,
            activeNodeIndex: 0,
        }
    };

    return newState;
}
