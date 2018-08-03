import { TESTNET_CONFIG, create } from 'waves-api'
import {
  generate,
  CREATE_ORDER_SIGNATURE,
  ITRANSFER_PROPS,
  IBURN_PROPS,
  IISSUE_PROPS,
  ISET_SCRIPT_PROPS,
  TX_NUMBER_MAP,
  TRANSACTION_TYPE_NUMBER,
  TRANSACTION_TYPE_VERSION,
  ISSUE2,
  ISSUE,
  SET_SCRIPT,
  REISSUE,
  IREISSUE_PROPS,
  REISSUE2,
  BURN2,
  BURN,
  LEASE2,
  LEASE,
  CANCEL_LEASING,
  CANCEL_LEASING2,
  CREATE_ALIAS,
  CREATE_ALIAS2,
  MASS_TRANSFER,
  TRANSFER,
  TRANSFER2
} from './crypto'
import Axios from 'axios';
import { IEnvironmentState, defaultEnv } from '../state';

const w = create(TESTNET_CONFIG)

export interface KeyPair {
  public: string
  private: string
}

export const waves = (env: IEnvironmentState) => {

  const keyPair = (seed: string = env.SEED): KeyPair => {
    const kp = w.Seed.fromExistingPhrase(seed).keyPair
    return { public: kp.publicKey, private: kp.privateKey }
  }

  const publicKey = (seed: string = env.SEED): string =>
    keyPair(seed).public

  const privateKey = (seed: string = env.SEED): string =>
    keyPair(seed).private

  const _ = {
    keyPair,
    publicKey,
    privateKey,
    address(keyPairOrSeed: KeyPair | string = env.SEED) {
      if (typeof keyPairOrSeed === 'string') {
        return w.Seed.fromExistingPhrase(keyPairOrSeed).address
      }
      return w.tools.getAddressFromPublicKey(keyPairOrSeed.public)
    },
    issue(
      name: string,
      description: string,
      decimals: number,
      quantity: number,
      reissuable: boolean,
      fee: number = 100000000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED) {

      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.ISSUE,
        version,
        name,
        description,
        decimals: decimals,
        quantity: quantity.toString(),
        reissuable,
        fee: fee.toString(),
        senderPublicKey: publicKey(seed),
        timestamp,
        chainId: env.CHAIN_ID
      }

      const signature = (version == 2 ? new ISSUE2(tx) : new ISSUE(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, quantity, proofs: [signature] }

      return { ...tx, fee, quantity, signature }
    },
    reissue(
      assetId: string,
      quantity: number,
      reissuable: boolean,
      fee: number = 100000000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.REISSUE,
        assetId,
        version,
        quantity: quantity.toString(),
        reissuable,
        fee: fee.toString(),
        senderPublicKey: publicKey(seed),
        timestamp,
      }

      const signature = (version == 2 ? new REISSUE2(tx) : new REISSUE(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, proofs: [signature] }
      return { ...tx, fee, signature }
    },
    burn(
      assetId: string,
      quantity: number,
      fee: number = 100000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.BURN,
        assetId,
        version,
        quantity: quantity.toString(),
        fee: fee.toString(),
        senderPublicKey: publicKey(seed),
        timestamp,
        chainId: env.CHAIN_ID.charCodeAt(0)
      }

      const signature = (version == 2 ? new BURN2(tx) : new BURN(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, quantity, proofs: [signature] }
      return { ...tx, fee, quantity, signature }
    },
    //transfer(1, 'WAVES', '3MwcFkC1CV7CexhRfucDAge67ZdUDb6nALr')
    transfer(
      amount: number,
      recipient: string,
      assetId: string = 'WAVES',
      attachment: string = '',
      feeAssetId: string = 'WAVES',
      fee: number = 100000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {

      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.TRANSFER,
        assetId,
        version,
        recipient,
        feeAssetId,
        amount: amount.toString(),
        fee: fee.toString(),
        senderPublicKey: publicKey(seed),
        timestamp,
        attachment,
      }

      const signature = (version == 2 ? new TRANSFER2(tx) : new TRANSFER(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, amount, proofs: [signature] }
      return { ...tx, fee, amount, signature }
    },
    lease(
      amount: number,
      recipient: string,
      fee: number = 200000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.LEASE,
        amount,
        version,
        recipient,
        fee: fee.toString(),
        senderPublicKey: publicKey(seed),
        timestamp,
      }

      const signature = (version == 2 ? new LEASE2(tx) : new LEASE(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, amount, proofs: [signature] }
      return { ...tx, fee, amount, signature }
    },
    cancelLease(
      txId: string,
      fee: number = 100000,
      timestamp: number = Date.now(),
      version: number = 1,
      chainId: string = env.CHAIN_ID,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
        version,
        txId,
        senderPublicKey: publicKey(env.SEED),
        fee,
        timestamp,
        chainId
      }

      const signature = (version == 2 ? new CANCEL_LEASING2(tx) : new CANCEL_LEASING(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, proofs: [signature] }
      return { ...tx, fee, signature }
    },
    createAlias(
      alias: string,
      fee: number = 100000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.CREATE_ALIAS,
        alias,
        version,
        senderPublicKey: publicKey(env.SEED),
        fee,
        timestamp
      }

      const signature = (version == 2 ? new CREATE_ALIAS2(tx) : new CREATE_ALIAS(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, proofs: [signature] }
      return { ...tx, fee, signature }
    },
    massTransfer(
      transfers: (string | number)[],
      fee: number = 100000 + 50000 * (transfers.length + 1),
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED) {

      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.MASS_TRANSFER,
        transfers: transfers.map((x, i) => i % 2 == 1 ? { amount: transfers[i - 1], recipient: x } : null).filter(x => x != null),
        version,
        senderPublicKey: publicKey(env.SEED),
        fee,
        timestamp
      }

      const signature = new MASS_TRANSFER(tx).getSignature(privateKey(seed))
      return { ...tx, fee, proofs: [signature] }
    },
    script(
      script: string,
      fee: number = 1000000,
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED
    ) {
      const tx: any = {
        type: TRANSACTION_TYPE_NUMBER.SET_SCRIPT,
        version,
        senderPublicKey: publicKey(env.SEED),
        script: 'base64:' + script,
        fee,
        timestamp
      }

      const signature = new SET_SCRIPT({
        chainId: env.CHAIN_ID.charCodeAt(0),
        fee,
        script: tx.script,
        senderPublicKey: tx.senderPublicKey,
        timestamp
      }).getSignature(privateKey(seed))

      return { ...tx, fee, proofs: [signature] }
    },
    broadcast(tx: any) {
      return Axios.post(env.API_BASE + 'transactions/broadcast', tx).then(x => x.data).catch(x => x.response.data)
    }
  }

  return _
}

//var tx = await broadcast(issue(1, 'name', 'desc', 1, 1, false))
// const ww = waves({ ...defaultEnv, SEED: 'test-seed-whaaaaaaaaaaaaa', })
// const r1 = ww.reissue('asset', 100, false)
// const r2 = ww.lease(100, '')
// const r3 = ww.burn('', 1, 3, 4)
// const r4 = ww.script('')
// const r5 = ww.massTransfer(['dfadf', 1])
