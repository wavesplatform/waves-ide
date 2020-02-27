import { TTx } from '@waves/waves-transactions';
import Signer from '@waves/signer';
import Provider from '@waves.exchange/provider-web';
import { range } from './range';

export async function signViaExchange(tx: TTx, NODE_URL: string, proofN = 0) {
    const signer = new Signer({NODE_URL});
    await signer.setProvider(new Provider());
    if (tx.type !== 4 && tx.type !== 7 && tx.type !== 11 && tx.type !== 15 && tx.type !== 16) {
    // if (tx.type === 13) {
        const signedTx = await signer.batch([{...tx, proofs: []}]).sign() as any;
        if (signedTx && 'proofs' in signedTx && signedTx.proofs.length > 0) {
            const signature = signedTx.proofs[0];
            let newProofs = [...tx.proofs];
            if (proofN + 1 > tx.proofs.length) {
                newProofs.push(...range(0, proofN + 1 - tx.proofs.length).map(_ => ''));
            }
            newProofs[proofN] = signature;
            newProofs = newProofs.map(proof => proof == null ? '' : proof);
            const result = {...signedTx, ...tx, proofs: newProofs};
            console.log(result);
            return result as any;
        }

    } else {
        throw 'unsupported transaction type';
    }
    throw 'transaction is not signed';
}

// function convert(tx: TTx) {
//     const result: any = {...tx};
//
//     if (tx.fee) {
//         result.fee = {
//             coins: tx.fee,
//             assetId: 'WAVES'
//         };
//     }
//     if ('feeAssetId' in tx) {
//         result.fee.assetId = tx.feeAssetId;
//     }
//     if ('amount' in tx) {
//         result.amount = {
//             coins: tx.amount,
//             assetId: result.assetId || 'WAVES'
//         };
//     }
//     if ('transfers' in tx) {
//         result.totalAmount = {
//             coins: '0',
//             assetId: tx.assetId || 'WAVES'
//         };
//     }
//
//     if (tx.type === 3) {
//         result.precision = (tx as any).precision == null ? 8 : (tx as any).precision;
//     }
//     return {
//         type: tx.type,
//         data: result
//     };
// }
