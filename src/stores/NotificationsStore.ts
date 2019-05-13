import { observable, action } from 'mobx';

import SubStore from '@stores/SubStore';

class NotificationsStore extends SubStore {
    @observable notification = '';

    @action
    notifyUser(text: string) {
        this.notification = text;
    }
}

export default NotificationsStore;
