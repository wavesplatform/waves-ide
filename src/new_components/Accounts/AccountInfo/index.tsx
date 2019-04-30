import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { AccountsStore, IAccount } from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';
import styles from './styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void };

interface IAccountInfoProps {
    activeAccount: IAccount,
    activeAccountIndex: number,
    accountsStore?: AccountsStore
}

@inject('accountsStore')
@observer
export default class AccountInfo extends React.Component<IAccountInfoProps> {
    private seedRef = createRef<HTMLTextAreaElement>();

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
            notification.newInstance({}, (notification: TNotification) => {
                notification.notice({content: 'Copied!'});
            });
        }
    };

    private handleSetSeed = (index: number) =>
        this.props.accountsStore!.setAccountSeed(index, this.seedRef.current!.value);

    private getCopyButton = (data: string) =>
        <div onClick={() => this.handleCopy(data)} className={styles.copyButton}/>;


    render() {
        const {activeAccount, activeAccountIndex: index} = this.props;
        const address = activeAccount.address;
        const publicKey = activeAccount.publicKey;
        const privateKey = activeAccount.privateKey;

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
                <div className={styles.infoTitle}>Seed{this.getCopyButton(activeAccount.seed)}</div>
                <textarea
                    rows={3}
                    className={styles.seed}
                    spellCheck={false}
                    value={activeAccount.seed}
                    ref={this.seedRef}
                    onChange={() => this.handleSetSeed(index)}
                />
            </div>
        </div>;
    }
}