// This migration is used to migrate from versionless state pre mobx

export const VERSION = 0;

export function migrate(oldState: any) {
    return {
        accountsStore: {
            accounts: oldState.accounts.accounts,
            defaultAccountIndex: oldState.accounts.selectedAccount
        },
        tabsStore: {
            tabs: oldState.editors.editors.map( ({fileId}: any) => ({fileId, type: 0})),
            activeTabIndex: oldState.editors.selectedEditor
        },
        filesStore: {
            files: oldState.files
        },
        settingsStore: {
            nodes: [{chainId: oldState.settings.chainId, url: oldState.settings.apiBase}]
        }
    };
}