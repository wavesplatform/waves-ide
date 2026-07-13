import React, { useEffect } from 'react';
import { useNotification } from 'rc-notification';
import NotificationsStore from '@stores/NotificationsStore';

interface IProps {
    store: NotificationsStore
}

export default function NotificationBridge({ store }: IProps) {
    const [api, holder] = useNotification({
        placement: 'bottomRight'
    });

    useEffect(() => {
        store.setApi(api);
        return () => store.clearApi();
    }, [api, store]);

    return holder;
}
