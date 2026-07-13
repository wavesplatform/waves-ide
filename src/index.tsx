import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';
import App from './layout/App';
import { RootStore } from '@stores';
import { autorun } from 'mobx';
import { loadState, saveState } from '@utils/localStore';
import setupMonaco from './setupMonaco';
import { mediator, SharingService, HotKeysService } from '@services';
import { createBrowserHistoryLike } from '@utils/history';
import NotificationBridge from '@components/Notification/Bridge';
import './global-styles';

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
const history = createBrowserHistoryLike();
const sharingService = new SharingService(mobXStore, history);
const hotKeysService = new HotKeysService(mobXStore, mediator, history);
hotKeysService.bindHotkeys();

const inject = {
    ...mobXStore,
    sharingService,
    hotKeysService
};

const container = document.getElementById('container');
if (container) {
    createRoot(container).render(
        <Provider {...inject}>
            <NotificationBridge store={mobXStore.notificationsStore}/>
            <App/>
        </Provider>
    );
}
