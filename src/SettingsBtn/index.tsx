import React from 'react';
import styles from './styles.less';

interface IInjectedProps {
}

export default class SettingsBtn extends React.Component<IInjectedProps> {
    render() {
        return <div className={styles['settings-btn']}>
            <div className={'settings-24-basic-600'}/>
        </div>;
    }
}