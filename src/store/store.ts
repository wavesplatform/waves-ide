import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './root-reducer';
import {syncEnvMiddleware} from "./repl-sync";
import {loadState} from "../utils/localStore";

const composeEnhancers =
    (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;


function configureStore(initialState?: object) {
    // configure middlewares
    const middlewares = [syncEnvMiddleware];
    // compose enhancers
    const enhancer = composeEnhancers(applyMiddleware(...middlewares));
    // create store
    return createStore(rootReducer, initialState!, enhancer);
}

// pass an optional param to rehydrate state on app start
const loadedState = loadState()
const store = configureStore(loadedState);

// export store singleton instance
export default store;