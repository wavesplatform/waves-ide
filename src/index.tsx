import * as React from 'react';
import { render } from 'react-dom';
import { Provider  } from 'mobx-react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { App } from './app';
import { RootStore } from '@src/mobx-store';
import { autorun } from 'mobx';
import { saveState, loadState } from '@utils/localStore';
import Mediator from '@utils/Mediator';
import setupMonaco from './setupMonaco';
import 'normalize.css';

import { Provider as  ComponentsMediatorProvider } from '@utils/ComponentsMediatorContext';

import { setupTestRunner } from '@utils/testRunner';

const theme = createMuiTheme({
    palette: {
        primary: {main: '#1f5af6'},
        secondary: {main: '#ff4081'},

    },
    typography: {
        useNextVariants: true,
    },
});

const initState = loadState();
// set version to 0 for old versionless storages
if (initState && !initState.VERSION) {
    initState.VERSION = 0;
}
const mobXStore = new RootStore(initState);

autorun(() => saveState(mobXStore.serialize()), {delay: 1000});

//setup monaco editor
setupMonaco();

//setup components mediator
let ComponentsMediator = new Mediator();

//setup test runner
setupTestRunner(ComponentsMediator);

render(
    <Provider {...mobXStore}>
        <MuiThemeProvider theme={theme}>
            <ComponentsMediatorProvider value={ComponentsMediator}>
                <App/>
            </ComponentsMediatorProvider>
        </MuiThemeProvider>
    </Provider>
    ,
    document.getElementById('container')
);
