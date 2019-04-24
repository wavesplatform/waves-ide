import React from 'react';
import { IAccount } from '@stores';
import Avatar from '../Avatar';
import styles from './styles.less';

interface IInjectedProps {
    account: IAccount,
    isActive: boolean,
    onRename: (value: string) => void,
    onDelete: () => void,
    onSelect: () => void
}

interface IAccountItemState {
    isEdit: boolean
}

export default class AccountItem extends React.Component<IInjectedProps, IAccountItemState> {
    state = {
        isEdit: false,
    };

    private handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEdit: false});
        }
    };

    private handleOpenRename = () => {
        this.props.onSelect();
        this.setState({isEdit: true});
    };

    private handleCloseRename = () => this.setState({isEdit: false});


    render() {
        const {onDelete, onRename, account, isActive, onSelect} = this.props;
        const {isEdit} = this.state;

        return <div className={styles.body_accountItem}>
            {isActive ? (
                <div className={styles.body_accIcon__on}/>
            ) : (
                <div
                    className={styles.body_accIcon__off}
                    onClick={onSelect}
                />
            )}
            <Avatar size={24} className={styles.body_avatar} address={account.privateKey}/>
            {isEdit ? (<input
                    className={styles.body_labelEditor}
                    onChange={(e) => onRename(e.target.value)}
                    onBlur={this.handleCloseRename}
                    onFocus={this.handleFocus}
                    onKeyDown={this.handleEnter}
                    value={account.label}
                    autoFocus={true}
                />
            ) : (
                <>
                    <div className={styles.body_itemName}>{account.label}</div>
                    <div className={styles.toolButtons}>
                        <div className="edit-12-basic-600" onClick={this.handleOpenRename}/>
                        <div className="delete-12-basic-600" onClick={onDelete}/>
                    </div>
                </>)
            }
        </div>;
    }
}
