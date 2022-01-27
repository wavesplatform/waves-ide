import React, { useState } from 'react';
import Button from '@components/Button';
import styles from '@src/layout/Dialogs/ImportAccountDialog/styles.less';
import Dialog from '@src/components/Dialog';
import Checkbox from '@components/Checkbox';
import { broadcast } from '@waves/waves-transactions';
import { SuccessMessage } from '@src/layout/Dialogs/TransactionSigning/SuccessMessage';
import { inject, observer } from 'mobx-react';
import { NotificationsStore, SettingsStore } from '@stores';

interface IProps {
    transactions: any[],
    visible: boolean,
    handleClose: () => void,
    // handleSend: () => void,
    networkOptions: {
        apiBase: string,
        nodeRequestOptions: RequestInit | undefined
    },
    notificationsStore?: NotificationsStore,
    settingsStore?: SettingsStore
}

export const SendingMultipleTransactions: React.FC<IProps> = inject('notificationsStore')(observer(
    (props) => {
        const {
            transactions,
            visible,
            handleClose,
            // handleSend,
            networkOptions: {apiBase, nodeRequestOptions},
            notificationsStore,
            settingsStore
        } = props;
        const [selectedTxs, setSelectedTxs] = useState<Record<string, object>>({});

        const handleSelectTx = (tx: any) => {
            let result = selectedTxs;
            if (result[tx.id]) {
                delete result[tx.id];
            } else {
                result[tx.id] = tx;
            }
            setSelectedTxs(result);
        };

        const showMessage = (data: JSX.Element | string, opts = {}) =>
            notificationsStore!.notify(data, {closable: true, duration: 10, ...opts});

        const isPublishDisabled = !Object.keys(selectedTxs).length;

        const sendTxs = () => {
            const selectedTransactions = Object.values(selectedTxs);
            const promises = selectedTransactions.map((tx: any) => broadcast(tx, apiBase, nodeRequestOptions));
            Promise.all(promises.map(p => {
                p.catch(e => {
                    if (e && e.hasOwnProperty('transaction')) {
                        return {...e.transaction, error: e.message};
                    } else {
                        return e;
                    }
                });
            })).then((txs: any[]) => {
                console.log('txs?', txs);
                const publishedTxs = txs.filter(txOrError => !txOrError.hasOwnProperty('error'));
                const errors = txs.filter(txOrError => txOrError.hasOwnProperty('error'));

                const publishedTxsIds = publishedTxs.reduce((acc, tx) => [...acc, tx.id], []);
                if (publishedTxs.length === selectedTransactions.length) {
                    showMessage(<SuccessMessage id={publishedTxsIds}
                                                node={settingsStore?.defaultNode}/>, {type: 'success'});
                } else {
                    if (publishedTxs.length) {
                        showMessage(<SuccessMessage id={publishedTxsIds}
                                                    node={props.settingsStore?.defaultNode}/>, {type: 'success'});
                    }
                    errors.forEach(errorObj => showMessage(JSON.stringify(errorObj), {type: 'error'}));
                }
            });
        };

        return <Dialog
            width={960}
            height={800}
            title="Select transactions for publish"
            footer={<>
                <Button className={styles.btn} onClick={handleClose}>Cancel</Button>
                <Button
                    className={styles.btn}
                    disabled={false}
                    onClick={sendTxs}
                    type="action-blue">
                    Publish
                </Button>
            </>}
            onClose={handleClose}
            visible={visible}
            className={styles.root}
        >
            {transactions.map((transaction, i) => <TransactionItem transaction={transaction}
                                                                   index={i}
                                                                   handleSelectTx={handleSelectTx}
                                                                   key={transaction.id}/>)}
        </Dialog>;
    }));

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

    console.log('TransactionItem', transaction)
    return <div style={{display: 'flex'}}>
        {index + 1}
        <Checkbox selected={isSelected} onSelect={handleSelect}/>
        {transaction.id}
    </div>;
};
