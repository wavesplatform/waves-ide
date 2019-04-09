import React, { createRef } from 'react';

import { inject, observer } from 'mobx-react';
import { AccountsStore, IAccount } from '@stores';

import { libs } from '@waves/waves-transactions';
import Popover from 'rc-tooltip';

import Avatar from '../Avatar';

import styles from '@src/new_components/Accounts/styles.less';

const {privateKey} = libs.crypto;

interface IInjectedProps {
    accountsStore?: AccountsStore
    index: number
    account: IAccount
}

interface IAccountItemState {
    isEdit: boolean
}

@inject('accountsStore')
@observer
export default class AccountItem extends React.Component<IInjectedProps, IAccountItemState> {

    state = {
        isEdit: false
    };

    private labelRef = createRef<HTMLInputElement>();

    private handleDelete = (key: number) => this.props.accountsStore!.deleteAccount(key);

    private handleRename = (key: number) =>
        this.props.accountsStore!.setAccountLabel(key, this.labelRef.current!.value);

    private handleFocus = () =>
        this.labelRef.current!.setSelectionRange(0, this.labelRef.current!.value.length);


    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEdit: false});
        }
    };

    private getButtons = (key: number, name: string) =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <div className="edit-12-basic-600"
                     onClick={() => this.setState({isEdit: true})}
                />
            </Popover>
            <Popover
                trigger="click"
                placement="bottom"
                overlay={
                    <div>
                        <p>Are you sure you want to delete&nbsp;<b>{name}</b>&nbsp;?</p>
                        <button className={styles.deleteButton}
                                onClick={() => this.handleDelete(key)}
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="delete-12-basic-600"/>
            </Popover>
        </div>;

    render() {
        const {accountsStore, index: i, account} = this.props;
        const activeIndex = accountsStore!.activeAccountIndex;
        return <div key={i} className={styles.body_accountItem}>
            {i === activeIndex
                ? <div className={styles.body_accIcon__on}/>
                : <div className={styles.body_accIcon__off}
                       onClick={() => accountsStore!.activeAccountIndex = i}/>}
            <Avatar size={24} className={styles.body_avatar} address={privateKey(account!.seed)}/>
            {this.state.isEdit
                ?
                <input
                    onChange={() => this.handleRename(i)}
                    onBlur={() => this.setState({isEdit: false})}
                    value={account.label}
                    ref={this.labelRef}
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
        </div>;
    }
}
