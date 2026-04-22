import React from 'react';
import SubStore from '@stores/SubStore';
import RootStore from '@stores/RootStore';
import { buildNotification } from '@components/Notification';
import type { NotificationAPI } from 'rc-notification/es/hooks/useNotification';

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
        borderTop: '2px solid #EF7362',
    },
    warning: {
        ...style,
        borderTop: '2px solid #FFD56A',
    },
    info: {
        ...style,
        borderTop: '2px solid #5A8AFF',
    },
    success: {
        ...style,
        borderTop: '2px solid #7ECF81',
    }
};

class NotificationsStore extends SubStore {
    private api?: NotificationAPI;
    private pending: Array<{ content: React.ReactNode; opts: TNotifyOptions }> = [];

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

    setApi = (api: NotificationAPI) => {
        this.api = api;
        const pending = [...this.pending];
        this.pending = [];
        pending.forEach(({ content, opts }) => this.notify(content, opts));
    };

    clearApi = () => {
        this.api = undefined;
    };

    notify(content: React.ReactNode, opts: TNotifyOptions = {}) {
        if (!this.api) {
            this.pending.push({ content, opts });
            return;
        }

        if (opts.key) {
            this.api.close(opts.key);
        }

        const type = opts.type || 'info';

        this.api.open({
            content: buildNotification(content, {...opts, type}),
            style: {...styles[type]},
            duration: opts.duration || 10,
            key: opts.key,
            closable: opts.closable,
        });
    }
}

export default NotificationsStore;
