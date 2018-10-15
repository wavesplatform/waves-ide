import * as React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import debounce = require('debounce')
import {App} from "./app";
import {store} from "./store";
import {saveState} from "./utils/localStore";

const theme = createMuiTheme({
    palette: {
        primary: {main: '#1f5af6'},
        secondary: {main: '#ff4081'},

    },
    typography: {
        useNextVariants: true,
    },
});

store.subscribe(debounce(() => {
    saveState(store.getState())
}, 500))


render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById("container")
)



