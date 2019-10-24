import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import App from './layout/App';
import { RootStore } from '@stores';
import { autorun } from 'mobx';
import { loadState, saveState } from '@utils/localStore';
import setupMonaco from './setupMonaco';
import { mediator, SharingService, HotKeysService } from '@services';
import { createBrowserHistory } from 'history';
import './global-styles';
import registerServiceWorker from './registerServiceWorker';

// Store init
const initState = loadState();
const mobXStore = new RootStore(initState);
autorun(() => {
    console.dir(mobXStore);
    saveState(mobXStore.serialize());
}, {delay: 1000});

// Monaco setup
setupMonaco();

// Services
const history = createBrowserHistory();
const sharingService = new SharingService(mobXStore, history);
const hotKeysService = new HotKeysService(mobXStore, mediator, history);
hotKeysService.bindHotkeys();

const inject = {
    ...mobXStore,
    sharingService,
    hotKeysService
};

render(
    <Provider {...inject}>
        <App history={history}/>
    </Provider>
    ,
    document.getElementById('container')
);

registerServiceWorker();


