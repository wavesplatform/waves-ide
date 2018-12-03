declare interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    Waves?: {
        signTransaction: (tx:any) => Promise<any>
    }
}

declare module '@waves/ride-js'