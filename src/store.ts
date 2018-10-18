import {applyMiddleware, compose, createStore} from 'redux'
import {loadState} from "./utils/localStore";
import {IAppState, rootReducer} from "./reducers"
import {ActionType} from "./actions"
import {Repl} from 'waves-repl'

const syncReplEnvMiddleware = applyMiddleware<IAppState>(store => next => action => {
    const nextAction = next(action);
    const state: IAppState = store.getState(); // new state after action was applied

    if (action.type === ActionType.SETTINGS_CHANGE) {
        Repl.updateEnv(state.env)
    }
    if ([ActionType.EDITOR_CODE_CHANGE, ActionType.NEW_EDITOR_TAB, ActionType.RENAME_EDITOR_TAB,
        ActionType.SELECT_EDITOR_TAB, ActionType.CLOSE_EDITOR_TAB].indexOf(action.type) > -1) {
        Repl.updateEnv(state.coding);
    }
    return nextAction;
});



const middlewares = [
    syncReplEnvMiddleware
];

if ((<any>window).__REDUX_DEVTOOLS_EXTENSION__) {
    middlewares.push((<any>window).__REDUX_DEVTOOLS_EXTENSION__());
}


const loadedState = loadState()
export const store = createStore(rootReducer, loadedState, compose(...middlewares));
