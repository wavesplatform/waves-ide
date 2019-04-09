import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';

import { AccountsStore, IAccount } from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';

import notification from 'rc-notification';

import styles from '@src/new_components/Accounts/styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void; };

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
        <div onClick={() => this.handleCopy(data)} className={styles.body_copyButton}/>;

    render() {
        const {activeAccount, activeAccountIndex: index} = this.props;
        const Address = activeAccount.address;
        const PublicKey = activeAccount.publicKey;
        const PrivateKey = activeAccount.privateKey;

        return <div className={styles.body_infoItems}>
            <div className={styles.body_infoItem}>
                <div className={styles.body_infoTitle}>Address{this.getCopyButton(Address)}</div>
                {Address}
            </div>
            <div className={styles.body_infoItem}>
                <div className={styles.body_infoTitle}>Public key{this.getCopyButton(PublicKey)}</div>
                {PublicKey}
            </div>
            <div className={styles.body_infoItem}>
                <div className={styles.body_infoTitle}>Private key{this.getCopyButton(PrivateKey)}</div>
                {PrivateKey}
            </div>
            <div className={styles.body_infoItem}>
                <div className={styles.body_infoTitle}>Seed{this.getCopyButton(activeAccount.seed)}</div>
                <textarea
                    rows={3}
                    className={styles.body_seed}
                    spellCheck={false}
                    value={activeAccount.seed}
                    ref={this.seedRef}
                    onChange={() => this.handleSetSeed(index)}
                />
            </div>
        </div>;
    }
}
