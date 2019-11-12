import React from 'react';
import styles from './styles.less';
import { TNotifyOptions } from '@stores/NotificationsStore';

interface IProps {
    type: 'error' | 'info' | 'warning' | 'success',
    content: string | JSX.Element,
    title?: string
}

const Notification: React.FC<IProps> =
    ({type, title, content}) => <div className={styles.root}>
        <div className={styles.body}>
            <Icon type={type}/>
            <div className={styles.content}>
                <div className={styles.title}>{title || type}</div>
                {content}
            </div>
        </div>
    </div>;


export const buildNotification = (content: string | JSX.Element, {type, title}: TNotifyOptions) => {
    if (!type) return null;
    return <Notification type={type} content={content} title={title}/>;
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

