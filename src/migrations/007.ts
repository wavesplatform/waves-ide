export const VERSION = 7;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        settingsStore: {
            ...oldState.settingsStore,
            activeNodeIndex: oldState.settingsStore.defaultNodeIndex || 0,
            testTimeout: 60000,
            nodeTimeout: 60000
        }
    };

    return newState;
}
