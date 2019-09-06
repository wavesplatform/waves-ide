export const VERSION = 8;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        settingsStore: {
            ...oldState.settingsStore,
            activeNodeIndex: oldState.settingsStore.activeNodeIndex + 1,
        }
    };

    return newState;
}
