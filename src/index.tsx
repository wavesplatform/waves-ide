import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import App from './components/App';
import { RootStore } from '@stores';
import { autorun } from 'mobx';
import { loadState, saveState } from '@utils/localStore';
import setupMonaco from './setupMonaco';
import { mediator, testRunner, SharingService, HotKeysService } from '@services';
import { createBrowserHistory } from 'history';
import './global-styles';
import notificationService from '@services/notificationService';

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
const hotKeys = new HotKeysService(mobXStore, mediator, history, testRunner, notificationService);
hotKeys.subscribeHotkeys();
export const hotKeysMap = hotKeys.hotKeysMap;

// Provide test runner file retrieving function
testRunner.updateEnv({file: mobXStore.filesStore.getFileContent});
// Subscribe to settings update
autorun(() => {
    testRunner.updateEnv(mobXStore.settingsStore.consoleEnv);
});

const inject = {
    ...mobXStore,
    sharingService,
    notificationService
};

render(
    <Provider {...inject}>
        <App history={history}/>
    </Provider>
    ,
    document.getElementById('container')
);


