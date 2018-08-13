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
  TRANSFER2,
  Seed,
  utils,
} from './crypto'
import Axios from 'axios';
import { IEnvironmentState, defaultEnv } from '../state';
import base58 from './crypto/libs/base58';
import crypto from './crypto/utils/crypto';
import { concatUint8Arrays } from './crypto/utils/concat';
import * as Long from 'long'

const w = create(TESTNET_CONFIG)

export interface KeyPair {
  public: string
  private: string
}

export const waves = (env: IEnvironmentState) => {

  /**
   * @preserve
   */
  const keyPair = (seed: string = env.SEED): KeyPair => {
    const kp = Seed.fromExistingPhrase(seed, env.CHAIN_ID.charCodeAt(0)).keyPair
    return { public: kp.publicKey, private: kp.privateKey }
  }

  /**
   * @preserve
   */
  const publicKey = (seed: string = env.SEED): string =>
    keyPair(seed).public

  /**
   * @preserve
   */
  const privateKey = (seed: string = env.SEED): string =>
    keyPair(seed).private

  /**
   * @preserve
   */
  const address = (keyPairOrSeed: KeyPair | string = env.SEED) => {
    if (typeof keyPairOrSeed === 'string') {
      return Seed.fromExistingPhrase(keyPairOrSeed, env.CHAIN_ID.charCodeAt(0)).address
    }

    return utils.crypto.buildRawAddress(base58.decode(keyPairOrSeed.public), env.CHAIN_ID.charCodeAt(0))
  }

  const _ = {
    keyPair,
    publicKey,
    privateKey,
    address,

    /**
     * @preserve
     */
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
        sender: address(seed),
        senderPublicKey: publicKey(seed),
        timestamp,
        chainId: env.CHAIN_ID
      }

      const signature = (version == 2 ? new ISSUE2(tx) : new ISSUE(tx)).getSignature(privateKey(seed))

      if (version == 2)
        return { ...tx, fee, quantity, proofs: [signature] }

      return { ...tx, fee, quantity, signature }
    },
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
    transfer(
      amount: number,
      recipient: string,
      assetId: string = '',
      attachment: string = '',
      feeAssetId: string = '',
      fee: number = 100000,
      timestamp: number = Date.now(),
      version: number = 2,
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

      const bytes = concat(
        byte(4),
        version > 1 ? byte(version) : empty,
        base58String(tx.senderPublicKey),
        option(base58String, tx.assetId),
        option(base58String, tx.feeAssetId),
        long(tx.timestamp),
        long(tx.amount),
        long(tx.fee),
        base58String(tx.recipient),
        shortLen(string, tx.attachment),
      )

      const sig = crypto.buildTransactionSignature(bytes, privateKey(seed));

      if (version == 2)
        return { ...tx, fee, amount, proofs: [sig] }
      return { ...tx, fee, amount, signature: sig }
    },
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
    massTransfer(
      transfers: (string | number)[],
      assetId: string = '',
      fee: number = 100000 + 50000 * (transfers.length + 1),
      timestamp: number = Date.now(),
      version: number = 1,
      seed: string = env.SEED) {

      const tx: any = {
        assetId,
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
    /**
     * @preserve
     */
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
    /**
     * @preserve
     */
    broadcast(tx: any) {
      return Axios.post(env.API_BASE + 'transactions/broadcast', tx).then(x => x.data).catch(x => x.response.data)
    }
  }

  return _
}

const concat = (...arrays: Uint8Array[]) =>
  arrays.reduce((a, b) => Uint8Array.from([...a, ...b]), new Uint8Array(0))

type serializer<T> = (value: T) => Uint8Array

const empty: Uint8Array = Uint8Array.from([])
const zero: Uint8Array = Uint8Array.from([0])
const one: Uint8Array = Uint8Array.from([1])

const base58String: serializer<string> = (value: string) => base58.decode(value)
const string: serializer<string> = (value: string) => Uint8Array.from([])
const byte: serializer<number> = (value: number) => Uint8Array.from([value])
const option = <T>(s: serializer<T>, value: T) =>
  value == undefined
    || value == null
    || (typeof value == 'string' && value.length == 0)
    ? zero : concat(one, s(value))
const shortLen = <T>(s: serializer<T>, value: T) => {
  const data = s(value)
  const len = new Buffer(2)
  len.writeUInt16BE(data.length, 0)
  return Uint8Array.from([...len, ...data])
}
const long: serializer<number> = (value: number) => {
  const l = Long.fromNumber(value)
  const b = new Buffer(8)
  b.writeInt32BE(l.getHighBits(), 0)
  b.writeInt32BE(l.getLowBits(), 4)
  return Uint8Array.from(b)
}