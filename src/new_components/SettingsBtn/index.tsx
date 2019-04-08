import React from 'react';
import styles from './styles.less';
import { RouteComponentProps, withRouter } from 'react-router';


export default withRouter(({history}: RouteComponentProps) =>
    <div className={styles['settings-btn']}>
        <div onClick={() => {
            history.push('/settings');
        }} className={'settings-24-basic-600'}/>
    </div>
);



