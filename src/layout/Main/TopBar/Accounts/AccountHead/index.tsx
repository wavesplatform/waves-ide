import { observer } from 'mobx-react';
import { IAccount } from '@stores';
import Avatar from '@src/components/Avatar';
import React from 'react';
import styles from './styles.less';
import classNames from 'classnames';

interface IProps {
    account?: IAccount
    onClick: () => void
    isOpened: boolean
}

const visibleBalance = (balance?: number) => ((balance || 0) / 1e8).toFixed(8);

const AccountHead = observer(({account, onClick, isOpened}: IProps) => (
    <div className={styles.root} onClick={onClick}>
        {account == null
            ?
            <NoAccount/>
            :
            <div className={styles.content}>
                <Avatar size={28} className={styles.avatar} address={account.address}/>
                {account.isScripted && <div className={styles.scripted_icon}/>}
                <div className={styles.textContainer}>
                    <div className={styles.name}>{account!.label}</div>
                    <div className={styles.balanceContainer}>
                        <div className={styles.wavesText}>WAVES</div>
                        <div className={styles.wavesBalance}>
                            {visibleBalance(account.wavesBalance)}
                        </div>
                    </div>
                </div>
            </div>}
        <div className={classNames(styles.head_arrow, {[styles.head_arrow__open]: isOpened})}/>
    </div>));

const NoAccount = () => (
    <div className={styles.content_empty}>
        <div className={styles.login_icon}/>
        <div className={styles.addText}>Add Account</div>
    </div>
);

export default AccountHead;


