import { createStore, compose, applyMiddleware } from 'redux'
import {rootReducer} from "./reducers"
import {ActionType} from "./actions"
import {Repl} from 'waves-repl'

const syncReplEnvMiddleware = applyMiddleware(store => next => action => {
    const nextAction = next(action);
    const state:any = store.getState(); // new state after action was applied

    if (action.type === ActionType.SETTINGS_CHANGE) {
       Repl.updateEnv(state.env)
    }

    Repl.updateEnv(state.coding);
    return nextAction;
});

const saveToLocalStoreMiddleware = applyMiddleware(store => next => action => {
    return next(action)
});

const middlewares = [
    syncReplEnvMiddleware,
    saveToLocalStoreMiddleware
];

if ((<any>window).__REDUX_DEVTOOLS_EXTENSION__) {
    middlewares.push((<any>window).__REDUX_DEVTOOLS_EXTENSION__());
}


export const store = createStore(rootReducer, compose(...middlewares));
