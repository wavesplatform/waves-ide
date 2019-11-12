import React from 'react';
import classNames from 'classnames';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { AccountsStore } from '@stores';
import { RouteComponentProps } from 'react-router';
import NotificationsStore from '@stores/NotificationsStore';
import Input from "@components/Input";

interface IInjectedProps {
    accountsStore?: AccountsStore
    notificationsStore?: NotificationsStore
}

interface IProps extends RouteComponentProps, IInjectedProps {
}

interface IState {
    seed: string
    seedInit: boolean
    name: string
    nameInit: boolean
}

@inject('accountsStore', 'notificationsStore')
@observer
export default class ImportAccountDialog extends React.Component<IProps, IState> {
    state = {
        seed: '',
        seedInit: false,
        name: '',
        nameInit: false
    };

    resetState = () => {
        this.setState({
            seed: '',
            seedInit: false,
            name: '',
            nameInit: false
        });
    };

    handleClose = () => {
        this.resetState();
        this.props.history.push('/');
    };

    handleImport = () => {
        const {accountsStore, notificationsStore} = this.props;
        accountsStore!.addAccount({label: this.state.name, seed: this.state.seed});
        notificationsStore!.notify('Done!', {type: 'success'});
        this.handleClose();
    };

    render() {

        const {seedInit, nameInit, seed, name} = this.state;

        const isSeedValid = this.state.seed !== '';
        const isNameValid = this.state.name !== '';

        return <Dialog
            title="Import account"
            onClose={this.handleClose}
            width={618}
            footer={<>
                <Button className={styles.btn} onClick={this.handleClose}>Cancel</Button>
                <Button
                    className={styles.btn}
                    type="action-blue"
                    disabled={!isNameValid || !isSeedValid}
                    onClick={this.handleImport}
                >Import</Button>
            </>}
            visible
        >
            <div className={styles.root}>
                <div className={styles.field}>
                    <div className={styles.label}>Seed phrase</div>
                    <Input
                        value={seed}
                        onBlur={() => this.setState({seedInit: true})}
                        onChange={(e) => this.setState({seed: e.target.value})}
                        className={classNames(styles.input, styles.input_seed)}
                        invalid={ seedInit && !isSeedValid }
                        multiline
                    />
                </div>
                <div className={styles.field}>
                    <div className={styles.label}>Account name (it will be shown in IDE)</div>
                    <Input
                        value={name}
                        onBlur={() => this.setState({nameInit: true})}
                        onChange={(e) => this.setState({name: e.target.value})}
                        className={classNames(styles.input)}
                        invalid={nameInit && !isNameValid}
                    />
                </div>
            </div>
        </Dialog>;
    }
}
