import reducers from './reducers';
import middlewares from "./middlewares";
import { createStore, compose, applyMiddleware } from 'redux';

// if ((<any>window).__REDUX_DEVTOOLS_EXTENSION__) {
//     middlewares.push((<any>window).__REDUX_DEVTOOLS_EXTENSION__());
// }

//const finalCreateStore = compose(...middlewares)(createStore);

const defaults:any = {};
try {
    defaults.settings = JSON.parse(
        localStorage.getItem('jsconsole.settings') || '{}'
    );
    defaults.history = JSON.parse(
        sessionStorage.getItem('jsconsole.history') || '[]'
    );
    defaults.env = JSON.parse(
        sessionStorage.getItem('jsconsole.env') || '{}'
    );
} catch (e) {
    console.log(e);
}

const configureStore = (preloadedState = {}) => {
  const store = createStore(
    reducers,
    preloadedState,
    middlewares
  );

  return store;
};

export default configureStore;

//const store = finalCreateStore(reducers, defaults);