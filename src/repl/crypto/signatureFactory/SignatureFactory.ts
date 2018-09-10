import {
  Alias,
  AssetId,
  Attachment,
  Base58, Base64,
  Bool,
  Byte,
  ByteProcessor, DataEntries,
  Long,
  MandatoryAssetId, OrderType,
  Recipient,
  StringWithLength, Transfers
} from '..';
import {
  IBURN_PROPS, ICANCEL_LEASING_PROPS, ICANCEL_ORDER_PROPS, ICREATE_ALIAS_PROPS, IDEFAULT_PROPS,
  IISSUE_PROPS, ILEASE_PROPS, IORDER_PROPS, IREISSUE_PROPS,
  ISignatureGenerator,
  ISignatureGeneratorConstructor, ITRANSFER_PROPS,
  TTX_NUMBER_MAP,
  TTX_TYPE_MAP
} from './interface';
import { concatUint8Arrays } from '../utils/concat';
import crypto from '../utils/crypto';
import * as constants from '../constants';


export function generate<T>(fields: Array<ByteProcessor | number>): ISignatureGeneratorConstructor<T> {

  if (!fields || !fields.length) {
    throw new Error('It is not possible to create TransactionClass without fields');
  }

  // Fields of the original data object
  const storedFields: object = Object.create(null);

  // Data bytes or functions returning data bytes via promises
  const byteProviders: Array<Function | Uint8Array> = [];

  fields.forEach(function (field: ByteProcessor) {
    if (field instanceof ByteProcessor) {
      // Remember user data fields
      storedFields[field.name] = field;
      // All user data must be represented as bytes
      byteProviders.push((data) => field.process(data[field.name]));
    } else if (typeof field === 'number') {
      // All static data must be converted to bytes as well
      byteProviders.push(Uint8Array.from([field]));
    } else {
      throw new Error('Invalid field is passed to the createTransactionClass function');
    }
  });

  class SignatureGenerator implements ISignatureGenerator {

    // Array of Uint8Array and promises which return Uint8Array
    private readonly _dataHolders: Array<Uint8Array>;
    // Request data provided by user
    private readonly _rawData: object;

    constructor(hashMap: any = {}) {

      // Save all needed values from user data
      this._rawData = Object.keys(storedFields).reduce((store, key) => {
        store[key] = hashMap[key];
        return store;
      }, {});

      this._dataHolders = byteProviders.map((provider) => {
        if (typeof provider === 'function') {
          // Execute function so that they return promises containing Uint8Array data
          return provider(this._rawData);
        } else {
          // Or just pass Uint8Array data
          return provider;
        }
      });
    }

    public getSignature(privateKey: string): string {
      return crypto.buildTransactionSignature(this.getBytes(), privateKey);
    }

    // Get byte representation of the transaction
    public getBytes(): Uint8Array {
      const multipleDataBytes = this._dataHolders

      console.log(this._dataHolders)
      if (multipleDataBytes.length === 1) {
        return multipleDataBytes[0];
      } else {
        return concatUint8Arrays(...multipleDataBytes);
      }
    }

    // Get bytes of an exact field from user data
    public getExactBytes(fieldName: string): Promise<Uint8Array> {

      if (!(fieldName in storedFields)) {
        throw new Error(`There is no field '${fieldName}' in 'RequestDataType class`);
      }

      const byteProcessor = storedFields[fieldName];
      const userData = this._rawData[fieldName];
      return byteProcessor.process(userData);
    }

  }

  return SignatureGenerator;
}

export const TX_NUMBER_MAP: TTX_NUMBER_MAP = Object.create(null);
export const TX_TYPE_MAP: TTX_TYPE_MAP = Object.create(null);

export const CREATE_ORDER_SIGNATURE = generate<IORDER_PROPS>([
  new Base58('senderPublicKey'),
  new Base58('matcherPublicKey'),
  new AssetId('amountAsset'),
  new AssetId('priceAsset'),
  new OrderType('orderType'),
  new Long('price'),
  new Long('amount'),
  new Long('timestamp'),
  new Long('expiration'),
  new Long('matcherFee')
]);

export const AUTH_ORDER_SIGNATURE = generate<IDEFAULT_PROPS>([
  new Base58('senderPublicKey'),
  new Long('timestamp')
]);

export const CANCEL_ORDER_SIGNATURE = generate<ICANCEL_ORDER_PROPS>([
  new Base58('senderPublicKey'),
  new Base58('orderId')
]);

export const ISSUE2 = generate<IISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.ISSUE,
  2,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new StringWithLength('name'),
  new StringWithLength('description'),
  new Long('quantity'),
  new Byte('decimals'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp'),
  0,
]);

export const ISSUE = generate<IISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.ISSUE,
  new Base58('senderPublicKey'),
  new StringWithLength('name'),
  new StringWithLength('description'),
  new Long('quantity'),
  new Byte('decimals'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp'),
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.ISSUE] = ISSUE;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.ISSUE] = ISSUE;

export const TRANSFER = generate<ITRANSFER_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.TRANSFER,
  new Base58('senderPublicKey'),
  new AssetId('assetId'),
  new AssetId('feeAssetId'),
  new Long('timestamp'),
  new Long('amount'),
  new Long('fee'),
  new Recipient('recipient'),
  new Attachment('attachment')
]);

export const TRANSFER2 = generate<ITRANSFER_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.TRANSFER,
  constants.TRANSACTION_TYPE_VERSION.TRANSFER,
  new Base58('senderPublicKey'),
  new AssetId('assetId'),
  new AssetId('feeAssetId'),
  new Long('timestamp'),
  new Long('amount'),
  new Long('fee'),
  new Recipient('recipient'),
  new Attachment('attachment')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.TRANSFER] = TRANSFER;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.TRANSFER] = TRANSFER;

export const REISSUE = generate<IREISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.REISSUE,
  constants.TRANSACTION_TYPE_VERSION.REISSUE,
  new Base58('senderPublicKey'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp')
]);

export const REISSUE2 = generate<IREISSUE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.REISSUE,
  constants.TRANSACTION_TYPE_VERSION.REISSUE,
  new Base58('senderPublicKey'),
  new Byte('version'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Bool('reissuable'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.REISSUE] = REISSUE;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.REISSUE] = REISSUE;

export const BURN = generate<IBURN_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.BURN,
  new Base58('senderPublicKey'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Long('fee'),
  new Long('timestamp')
]);

export const BURN2 = generate<IBURN_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.BURN,
  new Byte('version'),
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new MandatoryAssetId('assetId'),
  new Long('quantity'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.BURN] = BURN;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.BURN] = BURN;

export const LEASE = generate<ILEASE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.LEASE,
  new Base58('senderPublicKey'),
  new Recipient('recipient'),
  new Long('amount'),
  new Long('fee'),
  new Long('timestamp')
]);

export const LEASE2 = generate<ILEASE_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.LEASE,
  constants.TRANSACTION_TYPE_VERSION.LEASE,
  0, //assetId empty option
  new Base58('senderPublicKey'),
  new Recipient('recipient'),
  new Long('amount'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.LEASE] = LEASE;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.LEASE] = LEASE;

export const CANCEL_LEASING = generate<ICANCEL_LEASING_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
  new Base58('senderPublicKey'),
  new Long('fee'),
  new Long('timestamp'),
  new Base58('txId')
]);

export const CANCEL_LEASING2 = generate<ICANCEL_LEASING_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
  constants.TRANSACTION_TYPE_VERSION.CANCEL_LEASING,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  new Long('fee'),
  new Long('timestamp'),
  new Base58('txId')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING] = CANCEL_LEASING;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.CANCEL_LEASING] = CANCEL_LEASING;

export const CREATE_ALIAS = generate<ICREATE_ALIAS_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CREATE_ALIAS,
  new Base58('senderPublicKey'),
  new Alias('alias'),
  new Long('fee'),
  new Long('timestamp')
]);

export const CREATE_ALIAS2 = generate<ICREATE_ALIAS_PROPS>([
  constants.TRANSACTION_TYPE_NUMBER.CREATE_ALIAS,
  constants.TRANSACTION_TYPE_VERSION.CREATE_ALIAS,
  new Base58('senderPublicKey'),
  new Alias('alias'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.CREATE_ALIAS] = CREATE_ALIAS;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.CREATE_ALIAS] = CREATE_ALIAS;

export const MASS_TRANSFER = generate([
  constants.TRANSACTION_TYPE_NUMBER.MASS_TRANSFER,
  constants.TRANSACTION_TYPE_VERSION.MASS_TRANSFER,
  new Base58('senderPublicKey'),
  new AssetId('assetId'),
  new Transfers('transfers'),
  new Long('timestamp'),
  new Long('fee'),
  new Attachment('attachment')
]);


TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.MASS_TRANSFER] = MASS_TRANSFER;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.MASS_TRANSFER] = MASS_TRANSFER;

export const DATA = generate([
  constants.TRANSACTION_TYPE_NUMBER.DATA,
  constants.TRANSACTION_TYPE_VERSION.DATA,
  new Base58('senderPublicKey'),
  new DataEntries('data'),
  new Long('timestamp'),
  new Long('fee')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.DATA] = DATA;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.DATA] = DATA;

export const SET_SCRIPT = generate([
  constants.TRANSACTION_TYPE_NUMBER.SET_SCRIPT,
  constants.TRANSACTION_TYPE_VERSION.SET_SCRIPT,
  new Byte('chainId'),
  new Base58('senderPublicKey'),
  1, // Beautiful, isn't it? :)
  new Base64('script'),
  new Long('fee'),
  new Long('timestamp')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.SET_SCRIPT] = SET_SCRIPT;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.SET_SCRIPT] = SET_SCRIPT;

const SPONSORSHIP = generate([
  constants.TRANSACTION_TYPE_NUMBER.SPONSORSHIP,
  constants.TRANSACTION_TYPE_VERSION.SPONSORSHIP,
  new Base58('senderPublicKey'),
  new Base58('assetId'), // Not the AssetId byte processor
  new Long('minSponsoredAssetFee'),
  new Long('timestamp'),
  new Long('fee')
]);

TX_NUMBER_MAP[constants.TRANSACTION_TYPE_NUMBER.SPONSORSHIP] = SPONSORSHIP;
TX_TYPE_MAP[constants.TRANSACTION_TYPE.SPONSORSHIP] = SPONSORSHIP;
