import React, { createRef } from 'react';
import { observer } from 'mobx-react';
import { IAccount } from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';
import styles from './styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void };

interface IAccountInfoProps {
    account: IAccount
}

@observer
export default class AccountInfo extends React.Component<IAccountInfoProps> {
    private seedRef = createRef<HTMLTextAreaElement>();
    private notificationInstance?: TNotification;

    constructor(props: IAccountInfoProps) {
        super(props);
        notification.newInstance({}, (instance: TNotification) => {
            this.notificationInstance = instance;
        });
    }

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
            this.notificationInstance && this.notificationInstance.notice({content: 'Copied!'});
        }
    };

    private handleSetSeed = (account: IAccount) => account.seed = this.seedRef.current!.value;

    private getCopyButton = (data: string) =>
        <div onClick={() => this.handleCopy(data)} className={styles.copyButton}/>;


    render() {
        const {account} = this.props;
        const {address, publicKey, privateKey, seed} = account;

        return <div className={styles.root}>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Address{this.getCopyButton(address)}</div>
                {address}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Public key{this.getCopyButton(publicKey)}</div>
                {publicKey}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Private key{this.getCopyButton(privateKey)}</div>
                {privateKey}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Seed{this.getCopyButton(seed)}</div>
                <textarea
                    rows={3}
                    className={styles.seed}
                    spellCheck={false}
                    value={seed}
                    ref={this.seedRef}
                    onChange={() => this.handleSetSeed(account)}
                />
            </div>
        </div>;
    }
}