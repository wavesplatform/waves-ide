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

const defaultOptionsByType: Record<string, Partial<TNotifyOptions>> = {
    success: { duration: 5, closable: true },
    error: { duration: 30, closable: true },
    warning: { duration: 10, closable: true },
    info: { duration: 2, closable: true }
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

    // Основной метод
    notify(content: React.ReactNode, opts: TNotifyOptions = {}) {
        if (!this.api) {
            this.pending.push({ content, opts });
            return;
        }

        if (opts.key) {
            this.api.close(opts.key);
        }

        const type = opts.type || 'info';
        const defaults = defaultOptionsByType[type] || {};
        const mergedOpts = { ...defaults, ...opts };

        this.api.open({
            content: buildNotification(content, { ...mergedOpts, type }),
            style: { ...styles[type] },
            duration: mergedOpts.duration,
            key: mergedOpts.key,
            closable: mergedOpts.closable,
        });
    }

    success = (content: React.ReactNode, opts?: Omit<TNotifyOptions, 'type'>) =>
        this.notify(content, { ...opts, type: 'success' });

    error = (content: React.ReactNode, opts?: Omit<TNotifyOptions, 'type'>) =>
        this.notify(content, { ...opts, type: 'error' });

    warning = (content: React.ReactNode, opts?: Omit<TNotifyOptions, 'type'>) =>
        this.notify(content, { ...opts, type: 'warning' });

    info = (content: React.ReactNode, opts?: Omit<TNotifyOptions, 'type'>) =>
        this.notify(content, { ...opts, type: 'info' });
}

export default NotificationsStore;
