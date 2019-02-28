import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Provider as MobXProvider } from 'mobx-react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import debounce from 'debounce';
import { App } from './app';
import { store } from '@store';
import { RootStore } from '@src/mobx-store';
import { toJS } from 'mobx';
import { selectEnvState } from '@store/env-sync';
import { saveState } from '@utils/localStore';
import { setupTestRunner } from '@utils/testRunner';
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
    saveState(store.getState());
}, 500));

setupTestRunner(selectEnvState(store.getState()));

// let initState = {};
// try {
//     initState = JSON.parse(localStorage.getItem('store')!)
// }catch (e) {
//
// }

const mobXStore = new RootStore();
(window as any).mobXStore = mobXStore;
(window as any).toJS = toJS
render(
    <MobXProvider {...mobXStore}>
        <Provider store={store}>
            <MuiThemeProvider theme={theme}>
                <App/>
            </MuiThemeProvider>
        </Provider>
    </MobXProvider>
,
    document.getElementById('container')
);
