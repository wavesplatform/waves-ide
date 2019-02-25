import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import debounce from 'debounce';
import { App } from './app';
import { store } from '@store';
import { selectAccounts } from '@selectors';
import { saveState } from '@utils/localStore';
import { createTestRunner } from '@utils/testRunner';
import setupMonaco from './setupMonaco';
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

//setup monaco editor
setupMonaco();

//save default store state to localstore
if (localStorage.getItem('store') === null) {
    saveState(store.getState());
}

store.subscribe(debounce(() => {
    saveState(store.getState())
}, 500));

createTestRunner(selectAccounts(store.getState()));

render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('container')
);
