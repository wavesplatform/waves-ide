import React from 'react';
import styles from './styles.less';
import { TNotifyOptions } from '@stores/NotificationsStore';
import Scrollbar from '@components/Scrollbar';

interface IProps {
    type: 'error' | 'info' | 'warning' | 'success',
    title?: string
    children?: React.ReactNode
}

const Notification: React.FC<IProps> =
    ({type, title, children}) => <div className={styles.root}>
            <Icon type={type}/>
            <div className={styles.body}>
                <div className={styles.title}>{title || type}</div>
                <Scrollbar className={styles.content}>{children}</Scrollbar>
            </div>
    </div>;


export const buildNotification = (content: React.ReactNode, {type, title}: TNotifyOptions) => {
    if (!type) return null;
    return <Notification type={type} title={title}>{content}</Notification>;
};

const Icon: React.FunctionComponent<{ type: 'error' | 'info' | 'warning' | 'success' }> = ({type}) => {
    let icon = null;
    switch (type) {
        case 'error':
            icon = <div className={styles.errorIcn}/>;
            break;
        case 'success':
            icon = <div className={styles.successIcn}/>;
            break;
        case 'info':
            icon = <div className={styles.infoIcn}/>;
            break;
        case 'warning':
            icon = <div className={styles.warningIcn}/>;
            break;
    }
    return <div className={styles.icon}>{icon}</div>;
}


export default Notification;

