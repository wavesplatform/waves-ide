import notification from 'rc-notification';

export type TNotifyOptions = Partial<{
    duration: number,
    closable: boolean,
    key: string
}>;

export class NotificationService {
    _instance?: any;

    constructor() {
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

export default new NotificationService();
