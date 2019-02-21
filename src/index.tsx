import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import debounce from 'debounce';
import { App } from './app';
import { store } from './store';
import { saveState } from '@utils/localStore';
import { createRunner } from '@utils/testsRunner';
import configureMonaco from './configureMonaco';
import 'normalize.css';

const theme = createMuiTheme({
    palette: {
        primary: {main: '#1f5af6'},
        secondary: {main: '#ff4081'},

    },
    typography: {
        useNextVariants: true,
    },
});

//configure monaco editor
configureMonaco();

//save default store state to localstore
if (localStorage.getItem('store') === null) {
    saveState(store.getState());
}

store.subscribe(debounce(() => {
    saveState(store.getState())
}, 500));

createRunner(store.getState().accounts.accounts.map(account => account.seed));

render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('container')
);



