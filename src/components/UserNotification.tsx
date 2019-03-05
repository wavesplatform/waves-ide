import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { inject, observer } from 'mobx-react';
import { RootStore } from '@src/mobx-store';

interface IInjectedProps {
    notification?: string
    onClose?: () => any
}

@inject((rootStore: RootStore) => ({
    notification: rootStore.notificationsStore.notification,
    onClose: () => rootStore.notificationsStore.notifyUser('')
}))

@observer
class UserNotificationComponent extends React.Component<IInjectedProps> {

    render() {
        const {notification, onClose} = this.props;
        return <Snackbar
            open={notification!.length > 0}
            message={notification}
            autoHideDuration={4000}
            onClose={onClose}/>;
    }
}

export const UserNotification = UserNotificationComponent;
