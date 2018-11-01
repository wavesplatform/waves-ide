import {
    alias,
    burn,
    cancelLease,
    data,
    issue,
    lease,
    massTransfer,
    reissue,
    setScript,
    transfer
} from 'waves-transactions'
import {TransactionType, Tx} from 'waves-transactions/transactions'
import {SeedTypes} from "waves-transactions/generic";

export function signTransaction(seed: SeedTypes, tx: Tx): Tx{
    switch (tx.type) {
        case TransactionType.Issue:
            return issue(seed, tx);
        case TransactionType.Transfer:
            return transfer(seed, tx);
        case TransactionType.Reissue:
            return reissue(seed, tx);
        case TransactionType.Burn:
            return burn(seed, tx);
        case TransactionType.Lease:
            return lease(seed, tx);
        case TransactionType.CancelLease:
            return cancelLease(seed, tx);
        case TransactionType.Alias:
            return alias(seed, tx);
        case TransactionType.MassTransfer:
            return massTransfer(seed, tx);
        case TransactionType.Data:
            return data(seed, tx);
        case TransactionType.SetScript:
            return setScript(seed, tx);
        default:
            throw new Error(`Unknown tx type: ${tx!.type}`)
    }
}