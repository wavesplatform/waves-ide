import {
  Middleware,
  MiddlewareAPI,
  Dispatch,
  Action,
} from 'redux';

import { updateIFrameEnv } from '../lib/contextBinding';
import { SET_ENV } from '../actions/Env';

const syncIFrameEnv: Middleware = (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    const nextAction = next(action);
    const state: any = store.getState(); // new state after action was applied

    if (action.type === SET_ENV) {
        updateIFrameEnv(state.env);
    }
    return nextAction;
};

export default syncIFrameEnv;
