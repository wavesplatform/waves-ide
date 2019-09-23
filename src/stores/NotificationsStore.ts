import notification from 'rc-notification';
import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';

export type TNotifyOptions = Partial<{
    duration: number,
    closable: boolean,
    key: string
}>;

class NotificationsStore extends SubStore {
    _instance?: any;

    constructor(rootStore: RootStore) {
        super(rootStore);
        notification.newInstance({}, (notification: any) => this._instance = notification);
    }

    notify(content: string, opts: TNotifyOptions = {}) {
        if (opts.key) {
            this._instance.removeNotice(opts.key);
        }
        this._instance && this._instance.notice({
            content,
            duration: opts.duration || 10,
            key: opts.key,
            closable: opts.closable
        });
    }
}

export default NotificationsStore;
