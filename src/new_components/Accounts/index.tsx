import React from 'react';
import { inject, observer } from 'mobx-react';

import { AccountsStore } from '@stores';
import classNames from 'classnames';

import styles from './styles.less';
import Avatar from '@src/new_components/Avatar';
import AccountInfo from '@src/new_components/Accounts/AccountInfo';
import AccountItem from '@src/new_components/Accounts/AccountItem';
import Scrollbar from '@src/new_components/Scrollbar';

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
    constructor(props: IAccountProps) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.state = {
            isOpen: false
        };
    }

    wrapperRef: any;

    changeOpenStatus = () => this.setState({isOpen: !this.state.isOpen});

    setHiddenStatus = () => this.setState({isOpen: false});

    generateAccount = () => this.props.accountsStore!.generateAccount();

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef(node: any) {
        this.wrapperRef = node;
    }

    handleClickOutside(event: Event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setHiddenStatus();
        }
    }

    render() {
        const {isOpen} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;
        const activeAccountIndex = accountsStore!.activeAccountIndex;
        return <div ref={this.setWrapperRef} className={classNames(styles.root, className)}>
            <div className={styles.head} onClick={this.changeOpenStatus}>
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
                        <div className={styles.head_name}>Add Account</div>
                    </div>)
            }
                <div className={classNames(styles.head_arrow, {[styles.head_arrow__open]: isOpen})}/>
            </div>
            {isOpen && (
                <div className={styles.body}>
                    {activeAccount && <Scrollbar className={styles.body_scroll} suppressScrollX={true}>
                        <AccountInfo
                            activeAccount={activeAccount}
                            activeAccountIndex={activeAccountIndex}
                        />
                        {accountsStore!.accounts.map((account, i) =>
                            <AccountItem key={i} index={i} account={account}/>)}
                    </Scrollbar>}
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

