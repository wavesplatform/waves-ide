import {createStore, applyMiddleware, compose, Middleware} from 'redux';
import rootReducer from './root-reducer';
import {syncEnvMW} from "./repl-sync";
import {loadState} from "../utils/localStore";
import {createLogger} from "redux-logger";
import {fileManagerMW} from "./file-manager-mw";
import crypto from 'crypto';
const Storage = localStorage;

const composeEnhancers =
    (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

function configureStore(initialState?: object) {
    // configure middlewares
    const middlewares: Middleware[] = [syncEnvMW, fileManagerMW];

    if (process.env.NODE_ENV !== 'production') {
        const loggerMiddleware = createLogger();
        middlewares.push(loggerMiddleware)
    }
    // compose enhancers
    const enhancer = composeEnhancers(applyMiddleware(...middlewares));
    // create store
    return createStore(rootReducer, initialState!, enhancer);
}

// pass an optional param to rehydrate state on app start

if(process.env.IS_LOAD_FROM_JSON){
    getStateFromJson()
}

const loadedState = loadState();
const store = configureStore(loadedState);
// export store singleton instance

export default store;

function getStateFromJson() {
    let store;
    try{
        store = JSON.stringify(require('../assets/jsonStore.json'));
        let hash = crypto.createHash('md5').update(store).digest('hex');
        if(hash !== localStorage.getItem('hash')){
            localStorage.setItem("store",store)
            Storage.setItem('hash', hash);
        }
    } catch (e) {
        console.error(e)
    }
}