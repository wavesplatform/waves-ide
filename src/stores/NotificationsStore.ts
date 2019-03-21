import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

class NotificationsStore extends SubStore {
    @observable notification = '';

    @action
    notifyUser(text: string) {
        this.notification = text;
    }
}

export default NotificationsStore;
