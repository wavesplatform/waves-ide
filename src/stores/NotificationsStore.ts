import notification from 'rc-notification';
import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';
import { buildNotification } from '@components/Notification';

export type TNotifyOptions = Partial<{
    duration: number,
    closable: boolean,
    key: string

    type: 'error' | 'info' | 'warning' | 'success'
    title: string
}>;

const style = {
    borderRadius: '0',
    padding: 0,


};

const styles = {
    error: {
        ...style,
        borderTop: '2px solid #EF7362'
    },
    warning: {
        ...style,
        borderTop: '2px solid #FFD56A'
    },
    info: {
        ...style,
        borderTop: '2px solid #5A8AFF'
    },
    success: {
        ...style,
        borderTop: '2px solid #7ECF81'
    }
};

class NotificationsStore extends SubStore {
    _instance?: any;

    constructor(rootStore: RootStore) {
        super(rootStore);
        notification.newInstance({}, (notification: any) => this._instance = notification);
    }

    notify(content: string | JSX.Element, opts: TNotifyOptions = {}) {
        if (opts.key) {
            this._instance.removeNotice(opts.key);
        }

        const type = opts.type || 'info';

        this._instance && this._instance.notice({
            content: buildNotification(content, {...opts, type}),
            style: {...styles[type]},
            duration: opts.duration || 10,
            key: opts.key,
            closable: opts.closable
        });
    }
}

export default NotificationsStore;
