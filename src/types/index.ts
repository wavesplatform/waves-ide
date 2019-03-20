interface IAccount {
    label: string
    seed: string
}

enum FILE_TYPE {
    ASSET_SCRIPT = 'assetScript',
    ACCOUNT_SCRIPT = 'accountScript',
    TEST = 'test'
}

interface IFile {
    id: string
    type: FILE_TYPE
    name: string
    content: string
}

interface IRepl {
    name: string,
    instance: any,
    // isOpened: boolean
}

interface INode {
    chainId: string
    url: string
}

enum TAB_TYPE {
    EDITOR,
    WELCOME
}

type TTab = IEditorTab | IWelcomeTab;

interface ITab {
    type: TAB_TYPE
    //active: boolean
}

interface IEditorTab extends ITab {
    type: TAB_TYPE.EDITOR,
    fileId: string
}

interface IWelcomeTab extends ITab {
    type: TAB_TYPE.WELCOME
}

type Overwrite<T1, T2> = {
    [P in Exclude<keyof T1, keyof T2>]: T1[P]
} & T2;

interface IReplsPanel {
    height: number
    lastHeight: number
    isOpened: boolean
}

interface ISidePanel {
    width: number
    lastWidth: number
    lastDelta: number
    isOpened: boolean
}

export {
    IAccount,
    FILE_TYPE,
    IFile,
    IRepl,
    INode,
    TAB_TYPE,
    TTab,
    ITab,
    IEditorTab,
    IWelcomeTab,
    Overwrite,
    IReplsPanel,
    ISidePanel
};
