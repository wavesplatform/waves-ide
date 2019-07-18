import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import App from './components/App';
import { RootStore } from '@stores';
import { autorun } from 'mobx';
import { loadState, saveState } from '@utils/localStore';
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
import { HotKeys } from '@components/App/hotKeys';
import { mediator, testRunner } from '@services';
import { createBrowserHistory } from 'history';


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

const history = createBrowserHistory();

const hotKeys = new HotKeys(mobXStore, mediator, history, testRunner);

hotKeys.subscribeHotkeys();

export const hotKeysMap = hotKeys.hotKeysMap;

render(
    <Provider {...mobXStore}>
        <App history={history}/>
    </Provider>
    ,
    document.getElementById('container')
);


