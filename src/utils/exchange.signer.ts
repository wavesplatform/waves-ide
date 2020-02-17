import { TTx } from '@waves/waves-transactions';
import Signer from '@waves/signer';
import Provider from '@waves.exchange/provider-web';

export async function signViaExchange(tx: TTx, NODE_URL: string, proofN = 0,) {
    const signer = new Signer({NODE_URL});
    await signer.setProvider(new Provider());
    // if (tx.type !== 4 && tx.type !== 7 && tx.type !== 11 && tx.type !== 15 && tx.type !== 16) {
    if (tx.type === 13) {
        console.log(tx)
        const [signedTransfer] = await signer
            .transfer({amount: 100000000, recipient: 'alias:T:merry'}) // Transfer 1 WAVES to alias merry
            .sign();
        console.log(signedTransfer);
        tx.type = 13;
        const [signedTx] = await signer.setScript(tx).sign();
        console.log(signedTx);
    }
    throw 'error'
    // if (!window.Waves) throw new Error('WavesKeeper not found');
    //
    // const txInKeeperFormat = convert(tx);
    // // clear proofs, so we can safely get proof on index 0
    // txInKeeperFormat.data.proofs = [];
    // const signedTx = JSON.parse(await window.Waves.signTransaction(txInKeeperFormat));
    //
    // const signature = signedTx.proofs[0];
    // // const senderPublicKey = signedTx.senderPublicKey;
    // let newProofs = [...tx.proofs];
    // // set
    // if (proofN + 1 > tx.proofs.length) {
    //     newProofs.push(...range(0, proofN + 1 - tx.proofs.length).map(_ => ''));
    // }
    // newProofs[proofN] = signature;
    // newProofs = newProofs.map(proof => proof == null ? '' : proof);
    // return {...signedTx, ...tx, proofs: newProofs};
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
