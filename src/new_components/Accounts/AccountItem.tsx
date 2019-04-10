import React, { createRef } from 'react';

import { inject, observer } from 'mobx-react';
import { AccountsStore, IAccount } from '@stores';

import Popover from 'rc-tooltip';

import Avatar from '../Avatar';

import styles from '@src/new_components/Accounts/styles.less';
import Dialog from '@src/new_components/Dialog/';

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
    private labelRef = createRef<HTMLInputElement>();

    state = {
        isEdit: false,
        visibleDialog: false
    };

    private handleDelete = () => {
        this.setState({visibleDialog: false});
        this.props.accountsStore!.deleteAccount(this.props.index);
    };

    private handleRename = () =>
        this.props.accountsStore!.setAccountLabel(this.props.index, this.labelRef.current!.value);

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

    private handleOpenDeleteDialog = () => this.setState({visibleDialog: true});

    private handleCloseDeleteDialog = () => this.setState({visibleDialog: false});

    private handleOpenRename = () => this.setState({isEdit: true});

    private handleCloseRename = () => this.setState({isEdit: false});

    private getRnameOverlay = (content: JSX.Element) =>
        <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover" destroyTooltipOnHide={true}>
            {content}
        </Popover>;


    render() {
        const {accountsStore, index: i, account} = this.props;
        const activeIndex = accountsStore!.activeAccountIndex;
        const {isEdit, visibleDialog} = this.state;
        return <div key={i} className={styles.body_accountItem}>
            {i === activeIndex ? (
                <div className={styles.body_accIcon__on}/>
            ) : (
                <div
                    className={styles.body_accIcon__off}
                    onClick={() => accountsStore!.activeAccountIndex = i}
                />
            )}
            <Avatar size={24} className={styles.body_avatar} address={account.privateKey}/>
            {isEdit ? (<input
                    onChange={this.handleRename}
                    onBlur={this.handleCloseRename}
                    onFocus={this.handleFocus}
                    onKeyDown={this.handleEnter}
                    value={account.label}
                    ref={this.labelRef}
                    autoFocus={true}
                />
            ) : (
                <>
                    <div className={styles.body_itemName}>{account.label}</div>
                    <div className={styles.toolButtons}>
                        {this.getRnameOverlay(
                            <div className="edit-12-basic-600" onClick={this.handleOpenRename}/>
                        )}
                        <div className="delete-12-basic-600" onClick={this.handleOpenDeleteDialog}/>
                    </div>
                </>)
            }
            <Dialog
                title="Delete"
                onClose={this.handleCloseDeleteDialog}
                className={styles.root}
                width={450}
                visible={visibleDialog}
                footer={
                    <button className={styles.dialog_deleteBtn} onClick={this.handleDelete}>
                        Delete
                    </button>
                }
            >
                <p className={styles.dialog_content}>
                    Are you sure you want to delete&nbsp;
                    <b>{account.label}</b>&nbsp;?
                </p>
            </Dialog>
        </div>;
    }
}
