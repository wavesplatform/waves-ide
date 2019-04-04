export const VERSION = 2;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        settingsStore: {
            defaultNodeIndex: oldState.settingsStore.defaultNodeIndex + 2,
            customNodes: [
                ...oldState.settingsStore.nodes
            ]
        }
    };

    return newState;
}
