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
        const loggerMiddleware = createLogger()
        middlewares.push(loggerMiddleware)
    }
    // compose enhancers
    const enhancer = composeEnhancers(applyMiddleware(...middlewares));
    // create store
    return createStore(rootReducer, initialState!, enhancer);
}

// pass an optional param to rehydrate state on app start
const loadedState = (process.env.IS_LOAD_FROM_JSON)
    ? getStateFromJson(localStorage.getItem('hash'))
    : loadState();
const store = configureStore(loadedState);
// export store singleton instance
export default store;

function getStateFromJson(lastStateHash: string|null) {
    let state
    try{
        state = require('../assets/jsonStore.json');
        let hash = crypto.createHash('md5').update(JSON.stringify(state)).digest('hex');
        state = (hash === lastStateHash)?loadState():state;
        Storage.setItem('hash', hash);
    } catch (e) {
        console.error(e)
        state = loadState()
    }
    return state
}