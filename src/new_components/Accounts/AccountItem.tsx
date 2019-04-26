import React from 'react';
import { IAccount } from '@stores';
import Avatar from '../Avatar';
import styles from './styles.less';
import { observer } from 'mobx-react';
import DeleteConfirm from '@src/new_components/DeleteConfirm';

interface IInjectedProps {
    account: IAccount,
    isActive: boolean,
    onDelete: () => void,
    onSelect: () => void
}

interface IAccountItemState {
    isEdit: boolean
}

@observer
export default class AccountItem extends React.Component<IInjectedProps, IAccountItemState> {
    state = {isEdit: false};

    private handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEdit: false});
        }
    };

    private handleOpenRename = () => {
        this.setState({isEdit: true});
    };

    private handleCloseRename = () => this.setState({isEdit: false});

    private handleRename = (e: React.ChangeEvent<HTMLInputElement>) => this.props.account.label = e.target.value;

    render() {
        const {onDelete, account, isActive, onSelect} = this.props;
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
            <Avatar size={24} className={styles.body_avatar} address={account.address}/>
            {isEdit ? (<input
                    className={styles.body_labelEditor}
                    onChange={this.handleRename}
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
                        <DeleteConfirm
                            type="account"
                            align={{offset: [-39, 0]}}
                            owner={'accounts'}
                            name={account.label}
                            onDelete={onDelete}
                        >
                            <div className="delete-12-basic-600"/>
                        </DeleteConfirm>

                    </div>
                </>)
            }
        </div>;
    }
}
