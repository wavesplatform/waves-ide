import { TTx } from '@waves/waves-transactions';
import { range } from './range';

export async function signViaKeeper(tx: TTx, proofN = 0): Promise<TTx> {
    if (!window.Waves) throw new Error('WavesKeeper not found');

    const txInKeeperFormat = convert(tx);
    // clear proofs, so we can safely get proof on index 0
    txInKeeperFormat.data.proofs = [];
    const signedTxJSON = await window.Waves.signTransaction(txInKeeperFormat);
    const signature = JSON.parse(signedTxJSON).proofs[0];
    const senderPublicKey = JSON.parse(signedTxJSON).senderPublicKey;
    let newProofs = [...tx.proofs];
    // set
    if (proofN + 1 > tx.proofs.length) {
        newProofs.push(...range(0, proofN + 1 - tx.proofs.length).map(_ => ''));
    }
    newProofs[proofN] = signature;
    newProofs = newProofs.map(proof => proof == null ? '' : proof);
    return {...tx, proofs: newProofs, senderPublicKey};
}

function convert(tx: TTx) {
    const result: any = {...tx};

    if (tx.fee) {
        result.fee = {
            coins: tx.fee,
            assetId: 'WAVES'
        };
    }
    if ('feeAssetId' in tx) {
        result.fee.assetId = tx.feeAssetId;
    }
    if ('amount' in tx) {
        result.amount = {
            coins: tx.amount,
            assetId: result.assetId || 'WAVES'
        };
    }
    if ('transfers' in tx) {
        result.totalAmount = {
            coins: '0',
            assetId: tx.assetId || 'WAVES'
        };
    }

    if (tx.type === 3) {
        result.precision = (tx as any).precision == null ? 8 : (tx as any).precision;
    }
    return {
        type: tx.type,
        data: result
    };
}