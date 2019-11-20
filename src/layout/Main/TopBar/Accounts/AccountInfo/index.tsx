import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { IAccount } from '@stores';
import copyToClipboard from 'copy-to-clipboard';
import styles from './styles.less';
import NotificationsStore from '@stores/NotificationsStore';
import Input from '@components/Input';

interface IAccountInfoProps {
    account: IAccount
    notificationsStore?: NotificationsStore
}

@inject('notificationsStore')
@observer
export default class AccountInfo extends React.Component<IAccountInfoProps> {
    private seedRef = createRef<HTMLTextAreaElement>();

    constructor(props: IAccountInfoProps) {
        super(props);
    }

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
             this.props.notificationsStore!.notify('Copied!', {type: 'success'});
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
                {centerEllipsis(address)}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Public key{this.getCopyButton(publicKey)}</div>
                {centerEllipsis(publicKey)}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Private key{this.getCopyButton(privateKey)}</div>
                {centerEllipsis(privateKey)}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Seed{this.getCopyButton(seed)}</div>

                <Input
                    className={styles.seed}
                    value={seed}
                    inputRef={this.seedRef}
                    onChange={() => this.handleSetSeed(account)}
                    multiline
                />
            </div>
        </div>;
    }
}

function centerEllipsis(str: string, symbols = 26){
    if (str.length <= symbols) return str;
    return `${str.slice(0, symbols / 2)}...${str.slice(-symbols/2)}`;
}
