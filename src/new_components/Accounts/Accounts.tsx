import React from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';

import { AccountsStore } from '@stores';

import PerfectScrollbar from 'react-perfect-scrollbar';

import Avatar from '@src/new_components/Avatar';
import AccountItem from '@src/new_components/Accounts/AccountItem';
import AccountInfo from '@src/new_components/Accounts/AccountInfo';

import styles from './styles.less';


interface IInjectedProps {
    accountsStore?: AccountsStore
}

interface IAccountProps extends IInjectedProps {
    className: string
}

interface IAccountState {
    isOpen: boolean
}

@inject('accountsStore')
@observer
export default class Accounts extends React.Component<IAccountProps, IAccountState> {
    state = {isOpen: false};

    private generateAccount = () => this.props.accountsStore!.generateAccount();

    private changeOpenStatus = () => this.setState({isOpen: !this.state.isOpen});


    render() {
        const {isOpen} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;
        const activeAccountIndex = accountsStore!.activeAccountIndex;

        return <div className={classNames(styles.root, className)}>
            <div className={styles.head}>
                {activeAccount ?
                    (<div className={styles.head_info}>
                            <Avatar size={32} className={styles.head_avatar} address={activeAccount.privateKey}/>
                            <div className={styles.head_textContainer}>
                                <div className={styles.head_name}>{activeAccount!.label}</div>
                                <div className={styles.head_status}>
                                    <div className={styles.head_indicator}/>
                                    Active
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.head_info}>
                            <div className={styles.head_login}/>
                            <div className={styles.head_name}>Generate / Import</div>
                        </div>)
                }
                <div
                    onClick={this.changeOpenStatus}
                    className={classNames(styles.head_arrow, {[styles.head_arrow__open]: isOpen})}
                />
            </div>
            {isOpen && (
                <div className={styles.body}>
                    {activeAccount && <PerfectScrollbar className={styles.body_scroll} option={{suppressScrollX: true}}>
                        <AccountInfo
                            activeAccount={activeAccount}
                            activeAccountIndex={activeAccountIndex}
                        />
                        {accountsStore!.accounts.map((account, i) => <AccountItem index={i} account={account}/>)}
                    </PerfectScrollbar>}
                    <div className={styles.buttonSet}>
                        <div className={styles.buttonSet_item}
                             onClick={this.generateAccount}
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
            )}
        </div>;
    }
}
