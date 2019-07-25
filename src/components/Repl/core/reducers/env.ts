import {SET_ENV} from '../actions/Env';

const defaultState = {};

const reducer = (state = defaultState, action:any) => {
    if (action.type === SET_ENV) {
        return Object.assign({}, state, action.value)
    }
    return state;
};

export default reducer;
