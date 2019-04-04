import React from 'react';
import classNames from 'classnames';
import styles from './styles.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Popover from 'rc-tooltip';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';
import { inject, observer } from 'mobx-react';
import { AccountsStore, IAccount } from '@stores';
import { libs } from '@waves/waves-transactions';
import { generateMnemonic } from 'bip39';
import { Avatar } from '@src/new_components/Avatar/Avatar';

const {privateKey, publicKey, address} = libs.crypto;


type TNotification = { notice: (arg0: { content: string; }) => void; };

interface IInjectedProps {
    accountsStore?: AccountsStore
}

interface IAccountProps extends IInjectedProps {
    className: string
}

@inject('accountsStore')
@observer
export default class Accounts extends React.Component<IAccountProps> {

    state = {
        isOpen: true,
        editingLabel: null
    };

    private handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
            notification.newInstance({}, (notification: TNotification) => {
                notification.notice({content: 'Copied!'});
            });
        }
    };

    private handleRename = (key: number, name: string) => this.props.accountsStore!.setAccountLabel(key, name);

    private handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({editingLabel: null});
        }
    };

    private getCopyButton = (data: string) =>
        <div onClick={() => this.handleCopy(data)} className={styles.body_copyButton}/>;


    private createAccount = () => {
        const {accountsStore} = this.props;
        accountsStore!.createAccount(generateMnemonic());
        if (accountsStore!.accounts.length === 1) accountsStore!.setDefaultAccount(0);
    };

    private getButtons = (key: number, name: string) =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <div className="edit-12-basic-600"
                     onClick={() => this.setState({editingLabel: key})}
                />
            </Popover>
            <Popover
                trigger="click"
                placement="bottom"
                overlay={
                    <div>
                        <p>Are you sure you want to delete&nbsp;<b>{name}</b>&nbsp;?</p>
                        <button className={styles.deleteButton}
                                onClick={() => this.props.accountsStore!.deleteAccount(key)}
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="delete-12-basic-600"/>
            </Popover>
        </div>;

    private getAccountInfo = (activeAccount: IAccount) => {
        const {accountsStore} = this.props;
        const chainId = accountsStore!.rootStore.settingsStore.defaultNode!.chainId;
        const index = accountsStore!.defaultAccountIndex;
        const Address = address(activeAccount!.seed, chainId),
            PublicKey = publicKey(activeAccount!.seed),
            PrivateKey = privateKey(activeAccount!.seed);

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
                <div className={styles.body_infoTitle}>Seed{this.getCopyButton(activeAccount!.seed)}</div>
                <textarea rows={3}
                          className={styles.body_seed}
                          spellCheck={false}
                          value={activeAccount!.seed}
                          onChange={(e) => accountsStore!.setAccountSeed(index, e.target.value)}
                />
            </div>
        </div>;
    };

    render() {
        const {isOpen, editingLabel} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.defaultAccount;
        const activeIndex = accountsStore!.defaultAccountIndex;


        return <div className={classNames(styles.root, className)}>
            <div className={styles.head}>
                {activeAccount
                    ? <div className={styles.head_info}>
                        <Avatar size={32} className={styles.head_avatar} address={privateKey(activeAccount!.seed)}/>
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
                    {accountsStore!.accounts.map((account, i) =>
                        <div key={i} className={styles.body_accountItem}>
                            {i === activeIndex
                                ? <div className={styles.body_accIcon_on}/>
                                : <div className={styles.body_accIcon_off}
                                       onClick={() => accountsStore!.setDefaultAccount(i)}/>}
                            <Avatar size={24} className={styles.body_avatar} address={privateKey(account!.seed)}/>
                            {editingLabel === i
                                ?
                                <input
                                    onChange={(e) => this.handleRename(i, e.target.value)}
                                    onBlur={() => this.setState({editingLabel: null})}
                                    value={account.label}
                                    readOnly={false}
                                    onFocus={this.handleFocus}
                                    autoFocus={true}
                                    onKeyDown={(e) => this.handleEnter(e)}
                                />
                                : <>
                                    <div className={styles.body_itemName}>{account.label}</div>
                                    {this.getButtons(i, account.label)}
                                </>
                            }

                        </div>)
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
