import { createStore, applyMiddleware, compose, Store, Dispatch } from 'redux';
import rootReducer, {RootState} from './root-reducer';
import {RootAction} from "./root-action";
import {Repl} from "waves-repl";
import {loadState} from "../utils/localStore";

const composeEnhancers =
    (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const syncEnvMiddleware = (store: Store<RootState>) => (next: Dispatch<RootAction>) => (action: RootAction) => {
    const nextAction = next(action);
    const state = store.getState(); // new state after action was applied

    if (action.type === ActionType.SETTINGS_CHANGE) {
        Repl.updateEnv(state.env)
    }
    if ([ActionType.EDITOR_CODE_CHANGE, ActionType.NEW_EDITOR_TAB, ActionType.RENAME_EDITOR_TAB,
        ActionType.SELECT_EDITOR_TAB, ActionType.CLOSE_EDITOR_TAB].indexOf(action.type) > -1) {
        Repl.updateEnv(state.coding);
    }
    return nextAction;
};

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