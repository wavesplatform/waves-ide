export const VERSION = 2;

export function migrate(oldState: any) {
    const newState = {
        ...oldState,
        settingsStore: {
            defaultNodeIndex: 0,
            customNodes: [
                ...oldState.settingsStore.nodes
            ]
        }
    };

    return newState;
}
