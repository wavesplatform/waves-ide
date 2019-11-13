import React from 'react';
import styles from './styles.less';
import { TNotifyOptions } from '@stores/NotificationsStore';
import ScrollBar from "react-perfect-scrollbar";

interface IProps {
    type: 'error' | 'info' | 'warning' | 'success',
    title?: string
}

const Notification: React.FC<IProps> =
    ({type, title, children}) => <div className={styles.root}>
            <Icon type={type}/>
            <div className={styles.body}>
                <div className={styles.title}>{title || type}</div>
                <ScrollBar className={styles.content}>{children}</ScrollBar>
            </div>
    </div>;


export const buildNotification = (content: string | JSX.Element, {type, title}: TNotifyOptions) => {
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

