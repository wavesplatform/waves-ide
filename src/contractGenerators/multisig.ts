export function multisig(publicKeys: string[], M: number) {
    const N = publicKeys.length;
    if (M > N) throw new Error('Cannot create contract. M > N');
    if (N > 8) throw new Error('Cannot create contract. N > 8');
    return [DECLARE_PKs(publicKeys), DECLARE_SIGVERIFY(publicKeys), FOOTER(publicKeys, M)].join('\n')
}

const DECLARE_PKs = (pks: string[]) => pks.map((pk, i) => `let pKey${i} = base58'${pk}'`).join('\n');
const DECLARE_SIGVERIFY = (pks: string[]) => pks
    .map((pk, i) => `let pKey${i}Signed = if(sigVerify(tx.bodyBytes, tx.proofs[${i}], pKey${i})) then 1 else 0`).join('\n');
const FOOTER = (pks: string[], M: number) => pks.map((pk, i) => `pKey${i}Signed`).join(' + ') + ' > ' + M;
