import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { IAccount } from '@stores';
import copyToClipboard from 'copy-to-clipboard';
import styles from './styles.less';
import NotificationsStore from '@stores/NotificationsStore';
import Input from '@components/Input';
import Button from '@components/Button';

interface IAccountInfoProps {
    account: IAccount
    notificationsStore?: NotificationsStore
}

interface IState {
    showSeed: boolean
}

@inject('notificationsStore')
@observer
export default class AccountInfo extends React.Component<IAccountInfoProps, IState> {
    state = {
        showSeed: false
    };

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

    private handleShowSeed = () => this.setState({showSeed: true});

    render() {
        const {account} = this.props;
        const {showSeed} = this.state;
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
                {showSeed ? centerEllipsis(privateKey) : '.'.repeat(28)}
            </div>
            <div className={styles.infoItem}>
                <div className={styles.infoTitle}>Seed{this.getCopyButton(seed)}</div>
                {showSeed
                    ?
                    <Input
                        className={styles.seed}
                        value={seed}
                        inputRef={this.seedRef}
                        onChange={() => this.handleSetSeed(account)}
                        multiline
                    />
                    :
                    <Button className={styles.showSeed} onClick={this.handleShowSeed}>Show seed and private key</Button>
                }

            </div>
        </div>;
    }
}

function centerEllipsis(str: string, symbols = 26) {
    if (str.length <= symbols) return str;
    return `${str.slice(0, symbols / 2)}...${str.slice(-symbols / 2)}`;
}
