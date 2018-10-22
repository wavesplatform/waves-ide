import {createStore, applyMiddleware, compose, Middleware} from 'redux';
import rootReducer from './root-reducer';
import {syncEnvMiddleware} from "./repl-sync";
import {loadState} from "../utils/localStore";
import {createLogger} from "redux-logger";

const composeEnhancers =
    (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;


function configureStore(initialState?: object) {
    // configure middlewares
    const middlewares: Middleware[] = [syncEnvMiddleware];

    if (process.env.NODE_ENV !== 'production'){
        const loggerMiddleware = createLogger()
        middlewares.push(loggerMiddleware)
    }
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