import React from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';

import { AccountsStore, IAccount } from '@stores';
import { copyToClipboard } from '@utils/copyToClipboard';

import PerfectScrollbar from 'react-perfect-scrollbar';
import notification from 'rc-notification';

import Avatar from '@src/new_components/Avatar';
import AccountItem from '@src/new_components/Accounts/AccountItem';

import styles from './styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void; };

interface IInjectedProps {
    accountsStore?: AccountsStore
}

interface IAccountProps extends IInjectedProps {
    className: string
}

@inject('accountsStore')
@observer
export default class Accounts extends React.Component<IAccountProps, { isOpen: boolean }> {

    state = {isOpen: true};

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
            notification.newInstance({}, (notification: TNotification) => {
                notification.notice({content: 'Copied!'});
            });
        }
    };

    private getCopyButton = (data: string) =>
        <div onClick={() => this.handleCopy(data)} className={styles.body_copyButton}/>;


    private createAccount = () => {
        this.props.accountsStore!.generateAccount();
    };


    private getAccountInfo = (activeAccount: IAccount) => {
        const {accountsStore} = this.props;
        const index = accountsStore!.activeAccountIndex;

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
                <textarea rows={3}
                          className={styles.body_seed}
                          spellCheck={false}
                          value={activeAccount.seed}
                          onChange={(e) => accountsStore!.setAccountSeed(index, e.target.value)}
                />
            </div>
        </div>;
    };

    render() {
        const {isOpen} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;

        return <div className={classNames(styles.root, className)}>
            <div className={styles.head}>
                {activeAccount
                    ? <div className={styles.head_info}>
                        <Avatar size={32} className={styles.head_avatar} address={activeAccount.privateKey}/>
                        <div className={styles.head_textContainer}>
                            <div className={styles.head_name}>{activeAccount!.label}</div>
                            <div className={styles.head_status}>
                                <div className={styles.head_indicator}/>
                                Active
                            </div>
                        </div>
                    </div>
                    : <div className={styles.head_info}>
                        <div className={styles.head_login}/>
                        <div className={styles.head_name}>Generate / Import</div>
                    </div>}
                <div
                    onClick={() => this.setState({isOpen: !isOpen})}
                    className={isOpen ? styles.head_arrow_open : styles.head_arrow}
                />
            </div>
            {isOpen &&
            <div className={styles.body}>
                {activeAccount && <PerfectScrollbar className={styles.body_scroll} option={{suppressScrollX: true}}>
                    {this.getAccountInfo(activeAccount)}
                    {accountsStore!.accounts.map((account, i) => <AccountItem index={i} account={account}/>)
                    }
                </PerfectScrollbar>}
                <div className={styles.buttonSet}>
                    <div className={styles.buttonSet_item}
                         onClick={this.createAccount}
                    >
                        <div className={styles.buttonSet_icon}>
                            <div className="plus-14-submit-400"/>
                        </div>
                        Generate new account
                    </div>
                    <div className={styles.buttonSet_item}>
                        <div className={styles.buttonSet_icon}>
                            <div className="plus-14-submit-400"/>
                        </div>
                        Import accounts from Keeper
                    </div>
                </div>
            </div>
            }
        </div>;
    }

}
