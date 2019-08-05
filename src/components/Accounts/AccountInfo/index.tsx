import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { IAccount } from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';
import styles from './styles.less';
import { NotificationService } from '@services/notificationService';

interface IAccountInfoProps {
    account: IAccount
    notificationService?: NotificationService
}

@inject('notificationService')
@observer
export default class AccountInfo extends React.Component<IAccountInfoProps> {
    private seedRef = createRef<HTMLTextAreaElement>();

    constructor(props: IAccountInfoProps) {
        super(props);
    }

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
             this.props.notificationService!.notify('Copied!');
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
