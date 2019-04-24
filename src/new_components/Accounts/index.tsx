import React from 'react';
import { inject, observer } from 'mobx-react';

import { AccountsStore, IAccount } from '@stores';
import classNames from 'classnames';

import notification from 'rc-notification';

import Avatar from '@src/new_components/Avatar';
import AccountInfo from '@src/new_components/Accounts/AccountInfo';
import AccountItem from '@src/new_components/Accounts/AccountItem';
import Scrollbar from '@src/new_components/Scrollbar';
import ImportDialog from '@src/new_components/Accounts/ImportDialog';

import styles from './styles.less';

type TNotification = { notice: (arg0: { content: string; }) => void };

interface IInjectedProps {
    accountsStore?: AccountsStore
}

interface IAccountProps extends IInjectedProps {
    className: string
}

interface IAccountState {
    isOpen: boolean,
    isVisibleImportDialog: boolean
}

@inject('accountsStore')
@observer
export default class Accounts extends React.Component<IAccountProps, IAccountState> {
    constructor(props: IAccountProps) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.state = {
            isOpen: false,
            isVisibleImportDialog: false
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

    handleCloseImportDialog = () => this.setState({isVisibleImportDialog: false, isOpen: true});

    handleOpenImportDialog = () => this.setState({isVisibleImportDialog: true});

    handleImportAccount = (label: string, seed: string) => {
        const {accountsStore} = this.props;
        accountsStore!.addAccount({label, seed});
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: 'Done!'});
        });
        this.handleCloseImportDialog();
        this.setState({isOpen: true});
    };

    private handleDelete = (index: number) => () => this.props.accountsStore!.deleteAccount(index);

    private handleRename = (index: number) => (value: string) => this.props.accountsStore!.setAccountLabel(index, value);

    private handleSetActive = (index: number) => () => this.props.accountsStore!.activeAccountIndex = index;


    render() {
        const {isOpen, isVisibleImportDialog} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;
        const activeAccountIndex = accountsStore!.activeAccountIndex;
        return <div ref={this.setWrapperRef} className={classNames(styles.root, className)}>
            <div className={styles.head} onClick={this.changeOpenStatus}>
                <Account account={activeAccount}/>
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
                            <AccountItem
                                key={i}
                                account={account}
                                isActive={i === activeAccountIndex}
                                onDelete={this.handleDelete(i)}
                                onRename={this.handleRename(i)}
                                onSelect={this.handleSetActive(i)}
                            />)}
                    </Scrollbar>}
                    <div className={styles.buttonSet}>
                        <div className={styles.buttonSet_item} onClick={this.generateAccount}>
                            <div className={styles.buttonSet_icon}>
                                <div className="plus-14-submit-400"/>
                            </div>
                            Generate new account
                        </div>
                        <div className={styles.buttonSet_item} onClick={this.handleOpenImportDialog}>
                            <div className={styles.buttonSet_icon}>
                                <div className="plus-14-submit-400"/>
                            </div>
                            Import account
                        </div>
                    </div>
                </div>
            )}
            <ImportDialog
                visible={isVisibleImportDialog}
                handleClose={this.handleCloseImportDialog}
                handleImport={this.handleImportAccount}
            />
        </div>;
    }
}


const Account = observer(({account}: { account?: IAccount }) => (<>
    {account != null ?
        <div className={styles.head_info}>
            <Avatar size={32} className={styles.head_avatar} address={account.privateKey}/>
            {!account.isScripted && <div className={styles.head_scripted_icon}/>}
            <div className={styles.head_textContainer}>
                <div className={styles.head_name}>{account!.label}</div>
                <div className={styles.head_balanceContainer}>
                    <div className={styles.head_waves}>WAVES</div>
                    <div className={styles.head_wavesQuantity}>
                        {Math.round((account.wavesBalance || 0) / 10 ** 6) / 10 ** 2}
                    </div>
                </div>
            </div>
        </div> :
        <NoAccount/>
    }</>));

const NoAccount = () => (
    <div className={styles.head_info}>
        <div className={styles.head_login}/>
        <div className={styles.head_name}>Add Account</div>
    </div>
);
