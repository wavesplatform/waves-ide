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
import AccountHead from '@src/new_components/Accounts/AccountHead';

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
    state = {
        isOpen: false,
        isVisibleImportDialog: false
    };

    changeOpenStatus = () => this.setState({isOpen: !this.state.isOpen});

    setHiddenStatus = () => this.setState({isOpen: false});

    generateAccount = () => this.props.accountsStore!.generateAccount();

    openImportDialog = () => this.setState({isVisibleImportDialog: true});

    closeImportDialog = () => this.setState({isVisibleImportDialog: false, isOpen: true});

    handleClickOutside = (event: any) => {
        if (!(event.path.some((element: any) => element.dataset && element.dataset.owner === 'accounts'))) {
            this.setHiddenStatus();
        }
    };

    handleImportAccount = (label: string, seed: string) => {
        const {accountsStore} = this.props;
        accountsStore!.addAccount({label, seed});
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: 'Done!'});
        });
    };

    handleDelete = (index: number) => () => {
        this.props.accountsStore!.deleteAccount(index);
    };

    handleSetActive = (index: number) => () => this.props.accountsStore!.activeAccountIndex = index;

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {
        const {isOpen, isVisibleImportDialog} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;
        const activeAccountIndex = accountsStore!.activeAccountIndex;
        return <div data-owner={'accounts'} className={classNames(styles.root, className)}>
            <AccountHead account={activeAccount} onClick={this.changeOpenStatus} isOpened={isOpen}/>
            {isOpen && <div className={styles.body}>
                {activeAccount && <Scrollbar className={styles.body_scroll} suppressScrollX={true}>
                    <AccountInfo account={activeAccount}/>
                    {accountsStore!.accounts.map((account, i) =>
                        <AccountItem
                            key={i}
                            account={account}
                            isActive={i === activeAccountIndex}
                            onDelete={this.handleDelete(i)}
                            onSelect={this.handleSetActive(i)}
                        />)}
                </Scrollbar>}
                <ButtonSet onGenerate={this.generateAccount} onImport={this.openImportDialog}/>
            </div>}
            <ImportDialog
                visible={isVisibleImportDialog}
                onClose={this.closeImportDialog}
                onImport={this.handleImportAccount}
            />
        </div>;
    }
}

interface IButtonSetProps {
    onGenerate: () => void
    onImport: () => void
}

const ButtonSet = ({onGenerate, onImport}: IButtonSetProps) => <div className={styles.buttonSet}>
    <div className={styles.buttonSet_item} onClick={onGenerate}>
        <div className={styles.buttonSet_icon}>
            <div className="plus-14-submit-400"/>
        </div>
        Generate new account
    </div>
    <div className={styles.buttonSet_item} onClick={onImport}>
        <div className={styles.buttonSet_icon}>
            <div className="plus-14-submit-400"/>
        </div>
        Import account
    </div>
</div>;