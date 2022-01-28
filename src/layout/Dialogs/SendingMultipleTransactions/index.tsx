import React, { useState } from 'react';
import Button from '@components/Button';
import styles from '@src/layout/Dialogs/SendingMultipleTransactions/styles.less';
import Dialog from '@src/components/Dialog';
import Checkbox from '@components/Checkbox';
import { broadcast } from '@waves/waves-transactions';
import { SuccessMessage } from '@src/layout/Dialogs/TransactionSigning/SuccessMessage';
import { inject, observer } from 'mobx-react';
import { NotificationsStore, SettingsStore, Node } from '@stores';

interface IProps {
    transactions: any[],
    visible: boolean,
    handleClose: () => void,
    networkOptions: {
        nodeRequestOptions: RequestInit | undefined,
        defaultNode: Node
    },
    notificationsStore?: NotificationsStore,
    settingsStore?: SettingsStore
}

interface IState {
    selectedTxs: Record<string, object>;
}

@inject('notificationsStore')
@observer
export class SendingMultipleTransactions extends React.Component<IProps, IState> {
    state = {
        selectedTxs: {}
    };

    private handleSelectTx = (tx: any) => {
        let result = this.state.selectedTxs as any;
        if (result[tx.id]) {
            delete result[tx.id];
        } else {
            result[tx.id] = tx;
        }
        this.setState({selectedTxs: result});
    };

    showMessage = (data: JSX.Element | string, opts = {}) =>
        this.props.notificationsStore!.notify(data, {closable: true, duration: 10, ...opts});

    isPublishDisabled = !Object.keys(this.state.selectedTxs).length;

    sendTxs = async () => {
        const selectedTransactions = Object.values(this.state.selectedTxs);
        const promises = selectedTransactions.map((tx: any) => broadcast(tx, this.props.networkOptions.defaultNode.url, this.props.networkOptions.nodeRequestOptions));
        await Promise.all(promises.map(p => p.catch(e => e))).then((txs: any[]) => {
            const publishedTxs = txs.filter(txOrError => !txOrError.hasOwnProperty('error'));
            const errors = txs.filter(txOrError => txOrError.hasOwnProperty('error'));

            const publishedTxsIds = publishedTxs.reduce((acc, tx) => [...acc, tx.id], []);
            if (publishedTxs.length === selectedTransactions.length) {
                this.showMessage(<SuccessMessage id={publishedTxsIds}
                                                 node={this.props.networkOptions.defaultNode}/>, {type: 'success'});
            } else {
                if (publishedTxs.length) {
                    this.showMessage(<SuccessMessage id={publishedTxsIds}
                                                     node={this.props.networkOptions.defaultNode}/>, {type: 'success'});
                }
                errors.forEach(errorObj => this.showMessage(JSON.stringify(errorObj), {type: 'error'}));
            }
        });
    };

    render() {
        return <Dialog
            width={760}
            title="Select transactions for publish"
            footer={<>
                <Button className={styles.btn} onClick={this.props.handleClose}>Cancel</Button>
                <Button
                    className={styles.btn}
                    disabled={false}
                    onClick={this.sendTxs}
                    type="action-blue">
                    Publish
                </Button>
            </>}
            onClose={this.props.handleClose}
            visible={this.props.visible}
            className={styles.root}
        >
            <div className={styles.content}>
                {this.props.transactions.map((transaction, i) => <TransactionItem transaction={transaction}
                                                                                  index={i}
                                                                                  handleSelectTx={this.handleSelectTx}
                                                                                  key={transaction.id}/>)}
            </div>
        </Dialog>;
    }
}

interface ITransactionProps {
    transaction: any;
    index: number;
    handleSelectTx: (tx: any) => void;
}

const TransactionItem: React.FC<ITransactionProps> = (props) => {
    const {transaction, index, handleSelectTx} = props;
    const [isSelected, setIsSelected] = useState(false);

    const handleSelect = () => {
        setIsSelected(!isSelected);
        handleSelectTx(transaction);
    };

    return <div className={styles.transaction_item} onClick={handleSelect}>
        <div className={styles.transaction_index}>
            {index + 1}
        </div>
        <Checkbox selected={isSelected} onSelect={handleSelect}/>
        <div className={styles.transaction_id}>
            {transaction.id}
        </div>
    </div>;
};
