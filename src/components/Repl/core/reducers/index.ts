import {combineReducers} from 'redux';
import history from './history';
import settings from './settings';
import env from './env'

export default combineReducers({
    history,
    settings,
    env
});
