import React, { createRef } from 'react';

import { inject, observer } from 'mobx-react';
import { AccountsStore, IAccount } from '@stores';

import { libs } from '@waves/waves-transactions';
import Popover from 'rc-tooltip';

import Avatar from '../Avatar';

import styles from '@src/new_components/Accounts/styles.less';
import Dialog from '@src/new_components/Dialog/';

const {privateKey} = libs.crypto;

interface IInjectedProps {
    accountsStore?: AccountsStore
    index: number
    account: IAccount
}

interface IAccountItemState {
    isEdit: boolean
    visibleDialog: boolean
}

@inject('accountsStore')
@observer
export default class AccountItem extends React.Component<IInjectedProps, IAccountItemState> {

    state = {
        isEdit: false,
        visibleDialog: false,
    };

    private labelRef = createRef<HTMLInputElement>();

    private handleDelete = () => {
        this.setState({visibleDialog: false});
        this.props.accountsStore!.deleteAccount(this.props.index);
    };

    private handleRename = (key: number) =>
        this.props.accountsStore!.setAccountLabel(key, this.labelRef.current!.value);

    private handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };


    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEdit: false});
        }
    };

    private getButtons = () =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover" destroyTooltipOnHide={true}>
                <div className="edit-12-basic-600"
                     onClick={() => this.setState({isEdit: true})}
                />
            </Popover>
            <div className="delete-12-basic-600" onClick={() => this.setState({visibleDialog: true})}/>

        </div>;

    render() {
        const {accountsStore, index: i, account} = this.props;
        const activeIndex = accountsStore!.activeAccountIndex;
        const {isEdit, visibleDialog} = this.state;
        return <div key={i} className={styles.body_accountItem}>
            {i === activeIndex
                ? <div className={styles.body_accIcon__on}/>
                : <div className={styles.body_accIcon__off}
                       onClick={() => accountsStore!.activeAccountIndex = i}/>}
            <Avatar size={24} className={styles.body_avatar} address={privateKey(account!.seed)}/>
            {isEdit
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
                    {this.getButtons()}
                </>
            }

            <Dialog
                title="Delete"
                footer={
                    <button
                        className={styles.dialog_deleteBtn} onClick={this.handleDelete}>
                        Delete
                    </button>
                }
                onClose={() => this.setState({visibleDialog: false})}
                className={styles.root}
                width={450}
                visible={visibleDialog}
            >
                <p className={styles.dialog_content}>
                    Are you sure you want to delete&nbsp;
                    <b>{account.label}</b>&nbsp;?
                </p>
            </Dialog>
        </div>;
    }
}
