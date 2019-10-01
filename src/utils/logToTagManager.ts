export interface IItem {
    event: 'ideFileCreate' | 'ideContractDeploy' | 'ideCustomNodeAdd' | 'ideChainIdChange' |
        'ideGetShareLink' | 'ideOpenShareLink'

    [key: string]: any
}

export function logToTagManager(item: IItem) {
    if (Array.isArray(window.dataLayer)) {
        window.dataLayer && window.dataLayer.push(item);
    }
}

