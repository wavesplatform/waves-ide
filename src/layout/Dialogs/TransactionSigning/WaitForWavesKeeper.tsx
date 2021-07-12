import * as React from 'react';
import Button from '@src/components/Button';
import styles from './styles.less';

export const WaitForWavesKeeper = ({onCancel}: { onCancel: () => void }) =>
    <div className={styles.signing_WaitKeeperRoot}>
        <div className={styles.signing_WaitKeeperText}>
            <div className={styles.signing_title_blue}>Waiting for confirmation</div>
            <div className={styles.signing_loading}>Loading...</div>
        </div>
        <Button className={styles.signing_WaitKeeperBtn} onClick={onCancel}>Cancel</Button>
    </div>;
