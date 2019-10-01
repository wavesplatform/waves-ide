import React from 'react';
import { inject, observer } from 'mobx-react';

import { AccountsStore } from '@stores';
import classNames from 'classnames';

import AccountInfo from '@src/components/Accounts/AccountInfo';
import AccountItem from '@src/components/Accounts/AccountItem';
import Scrollbar from '@src/components/Scrollbar';

import styles from './styles.less';
import AccountHead from '@src/components/Accounts/AccountHead';
import { RouteComponentProps, withRouter } from 'react-router';
import { History } from 'history';

interface IInjectedProps {
    accountsStore?: AccountsStore
}

interface IAccountProps extends IInjectedProps, RouteComponentProps {
    className: string
}

interface IAccountState {
    isOpen: boolean,
}

@inject('accountsStore')
@observer
class Accounts extends React.Component<IAccountProps, IAccountState> {
    private accountItemsEndRef = React.createRef<HTMLDivElement>();
    private shouldScroll = false;

    state = {
        isOpen: false,
    };

    changeOpenStatus = () => this.setState({isOpen: !this.state.isOpen});

    setHiddenStatus = () => this.setState({isOpen: false});

    generateAccount = () => {
        this.props.accountsStore!.generateAccount();
        this.shouldScroll = true;
    };


    handleClickOutside = (event: any) => {
        const path = event.path || event.composedPath();
        if (!(path.some((element: any) => element.dataset && element.dataset.owner === 'accounts'))) {
            this.setHiddenStatus();
        }
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

    componentDidUpdate(prevProps: Readonly<IAccountProps>, prevState: Readonly<IAccountState>, snapshot?: any): void {
        if (this.shouldScroll) {
            this.accountItemsEndRef.current!.scrollIntoView();
            this.shouldScroll = false;
        }
    }

    render() {
        const {isOpen} = this.state;
        const {className, accountsStore} = this.props;
        const activeAccount = accountsStore!.activeAccount;
        const activeAccountIndex = accountsStore!.activeAccountIndex;
        return <div data-owner={'accounts'} className={classNames(styles.root, className, {[styles.openedBg]: isOpen})}>
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
                    <div ref={this.accountItemsEndRef}/>
                </Scrollbar>}
                <ButtonSet history={this.props.history} onGenerate={this.generateAccount}/>
            </div>}
        </div>;
    }
}

interface IButtonSetProps {
    onGenerate: () => void
    history: History
}

const ButtonSet = ({onGenerate, history}: IButtonSetProps) => <div className={styles.buttonSet}>
    <div className={styles.buttonSet_item} onClick={onGenerate}>
        <div className={styles.buttonSet_icon}>
            <div className={styles.plusIcn}/>
        </div>
        Generate new account
    </div>
    <div className={styles.buttonSet_item} onClick={() => history.push('/importAccount')}>
        <div className={styles.buttonSet_icon}>
            <div className={styles.plusIcn}/>
        </div>
        Import account
    </div>
</div>;


export default withRouter(Accounts);
