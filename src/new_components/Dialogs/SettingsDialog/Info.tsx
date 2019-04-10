import * as React from 'react';
import Popover from 'rc-tooltip';
import styles from '@src/new_components/Dialogs/SettingsDialog/styles.less';

const Info = () =>
    <Popover placement="bottomLeft" trigger="hover" align={{offset: [-34, 0]}} overlay={
        <div>
            <div className={styles.tooltip_title}>Headline</div>
            <div className={styles.tooltip_text}>Once the transaction is confirmed, the gateway will
                process the transfer of BTC to a token in your Waves account.
            </div>
            <div className={styles.tooltip_more}>Show more</div>
        </div>
    }>
        <div className={styles.info}/>
    </Popover>;

export default Info;
