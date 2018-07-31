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
  SET_SCRIPT
} from './crypto'
import Axios from 'axios';
import { IEnvironmentState } from 'state';

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
      version: number,
      name: string,
      description: string,
      decimals: number,
      quantity: number,
      reissuable: boolean,
      fee: number = 100000000,
      timestamp: number = Date.now(),
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
      }

      if (version == 2)
        tx.chainId = env.CHAIN_ID

      if (version == 2) {
        const signature = new ISSUE2(tx).getSignature(privateKey(seed))
        return { ...tx, fee, quantity, proofs: [signature] }
      }

      const signature = new ISSUE(tx).getSignature(privateKey(seed))
      return { ...tx, fee, quantity, signature }

    },
    script(
      version: number,
      script: string,
      fee: number = 100000000,
      timestamp: number = Date.now(),
      seed: string = env.SEED
    ) {
      const tx: any = {
        version,
        senderPublicKey: publicKey(env.SEED),
        script: 'base64:' + script,
        fee,
        timestamp
      }

      const signature = new SET_SCRIPT({
        chainId: env.CHAIN_ID,
        fee,
        script: tx.script,
        senderPublicKey: tx.senderPublicKey,
        timestamp
      }).getSignature(privateKey(seed))

      return { type: TRANSACTION_TYPE_NUMBER.SET_SCRIPT, ...tx, proofs: [signature] }
    },
    broadcast(tx: any) {
      return Axios.post(env.API_BASE + 'transactions/broadcast', tx).then(x => x.data).catch(x => x.response.data)
    }
  }

  return _
}

//var tx = await broadcast(issue(1, 'name', 'desc', 1, 1, false))