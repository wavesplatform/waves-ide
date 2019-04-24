import React from 'react';
import { IAccount } from '@stores';
import Avatar from '../Avatar';
import styles from './styles.less';

interface IInjectedProps {
    index: number
    account: IAccount,
    activeIndex: number,
    handleRename: (index: number, value: string) => void,
    handleDelete: (index: number) => void,
    handleSetActive: (index: number) => void
}

interface IAccountItemState {
    isEdit: boolean
}

export default class AccountItem extends React.Component<IInjectedProps, IAccountItemState> {
    state = {
        isEdit: false,
    };

    private handleFocus = (e: any) => e.target.select();

    private handleEnter = (e: React.KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEdit: false});
        }
    };

    private handleOpenRename = () => {
        this.props.handleSetActive(this.props.index);
        this.setState({isEdit: true});
    };

    private handleCloseRename = () => this.setState({isEdit: false});


    render() {
        const {handleDelete, handleRename, index, account, activeIndex, handleSetActive} = this.props;
        const {isEdit} = this.state;

        return <div className={styles.body_accountItem}>
            {index === activeIndex ? (
                <div className={styles.body_accIcon__on}/>
            ) : (
                <div
                    className={styles.body_accIcon__off}
                    onClick={() => handleSetActive(index)}
                />
            )}
            <Avatar size={24} className={styles.body_avatar} address={account.privateKey}/>
            {isEdit ? (<input
                    className={styles.body_labelEditor}
                    onChange={(e) => handleRename(index, e.target!.value)}
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
                        <div className="delete-12-basic-600" onClick={() => handleDelete(index)}/>
                    </div>
                </>)
            }
        </div>;
    }
}
