import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import App from './new_components/App';
import { RootStore } from '@stores';
import { autorun } from 'mobx';
import { saveState, loadState } from '@utils/localStore';
import setupMonaco from './setupMonaco';

import 'normalize.css';
import 'rc-menu/assets/index.css';
import 'rc-dropdown/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'rc-notification/assets/index.css';
import 'rc-dialog/assets/index.css';
import 'rc-tabs/assets/index.css';
import 'rc-tree/assets/index.css';
import 'rc-select/assets/index.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './styles/icons.less';
import './styles/fonts.less';



const initState = loadState();
// set version to 0 for old versionless storages
if (initState && !initState.VERSION) {
    initState.VERSION = 0;
}

const mobXStore = new RootStore(initState);

autorun(() => {
    console.dir(mobXStore);

    saveState(mobXStore.serialize());
}, {delay: 1000});

//setup monaco editor
setupMonaco();

render(
    <Provider {...mobXStore}>
        <App/>
    </Provider>
    ,
    document.getElementById('container')
);
