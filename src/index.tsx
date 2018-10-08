import {getMuiTheme} from "material-ui/styles";
import {palette} from "./style";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {store} from "./store";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {saveState} from "./utils/localStore";
import * as React from "react";
import {App} from "./app";
import debounce = require('debounce')


const muiTheme = getMuiTheme({
    palette
})

store.subscribe(debounce(() => {
    saveState(store.getState())
}, 500))


render(
    <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById("container")
)



