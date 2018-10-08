export * from "./coding"
export * from "./settings"
export * from "./notification"
export * from "./wizard"

export enum ActionType {
    // Coding
    EDITOR_CODE_CHANGE,
    NEW_EDITOR_TAB,
    CLOSE_EDITOR_TAB,
    SELECT_EDITOR_TAB,
    RENAME_EDITOR_TAB,

    // Wizard
    OPEN_WIZARD,
    CLOSE_WIZARD,
    CREATE_CONTRACT,

    // Notifications
    NOTIFY_USER,

    // Settings
    SETTINGS_CHANGE
}

