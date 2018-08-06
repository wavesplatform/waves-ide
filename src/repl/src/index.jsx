import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './core/store';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './core/jsconsole.css';

const rootEl = document.getElementById('root');
const App = require('./core/containers/App').default;

export const Repl = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};