//import { BigNumber } from 'bignumber.js'

export type Asset = string | null

export type Long = number //| BigNumber

export const enum TransactionType {
  Genesis = 1,
  Send = 2,
  Issue = 3,
  Transfer = 4,
  Reissue = 5,
  Burn = 6,
  Exchange = 7,
  Lease = 8,
  LeaseCancel = 9,
  Alias = 10,
  MassTransfer = 11,
}

export interface Block {
  _id: string;
  version: number;
  timestamp: number;
  reference: string;
  'nxt-consensus': {
    'base-target': Long;
    'generation-signature': string;
  };
  generator: string;
  fee: Long;
  blocksize: number;
  height: number;
  transactions: Transaction[];
  signature: string;

  // only in version 3
  transactionCount?: number;
  features?: number[];
}

export interface Order {
  id: string;
  sender: string;
  senderPublicKey: string;
  matcherPublicKey: string;
  // assetPair: {
  //   priceAsset: Asset;
  //   amountAsset: Asset;
  // };ƒ
  orderType: 'buy' | 'sell';
  price: Long;
  amount: Long;
  timestamp: number;
  expiration: number;
  matcherFee: Long;
  signature: string;
}

interface Tx {
  id: string;
  timestamp: number;
  fee: Long;
  signature?: string;
  proofs?: string[];
  version?: number;
}

export interface WithSender {
  sender: string;
  senderPublicKey: string;
}

// genesis
export interface Tx1 extends Tx {
  type: TransactionType.Genesis;
  recipient: string;
  amount: Long;
}

// send
export interface Tx2 extends Tx, WithSender {
  type: TransactionType.Send;
  recipient: string;
  amount: Long;
}

// issue
export interface Tx3 extends Tx, WithSender {
  type: TransactionType.Issue;
  assetId: string;
  name: string;
  description: string;
  quantity: Long;
  decimals: number;
  reissuable: boolean;
}

// transfer
export interface Tx4 extends Tx, WithSender {
  type: TransactionType.Transfer;
  recipient: string;
  assetId: Asset;
  amount: Long;
  feeAsset: Asset;
  attachment: string;
}

// reissue
export interface Tx5 extends Tx, WithSender {
  type: TransactionType.Reissue;
  assetId: Asset;
  quantity: Long;
  reissuable: boolean;
}

// burn
export interface Tx6 extends Tx, WithSender {
  type: TransactionType.Burn;
  assetId: Asset;
  amount: Long;
}

// exchange
export interface Tx7 extends Tx, WithSender {
  type: TransactionType.Exchange;
  order1: Order;
  order2: Order;
  amount: Long;
  price: Long;
  buyMatcherFee: Long;
  sellMatcherFee: Long;
  //computed
  pair: {
    priceAsset: Asset;
    amountAsset: Asset;
    priceDecimals: number;
    amountDecimals: number;
  }
}

// lease
export interface Tx8 extends Tx, WithSender {
  type: TransactionType.Lease;
  amount: Long;
  recipient: string;
}

// cancel lease
export interface Tx9 extends Tx, WithSender {
  type: TransactionType.LeaseCancel;
  leaseId: string;
}

// alias
export interface Tx10 extends Tx, WithSender {
  type: TransactionType.Alias;
  alias: string;
}

// mass transfer
export interface Tx11 extends Tx, WithSender {
  type: TransactionType.MassTransfer;
  assetId: string;
  attachment: string;
  transferCount: number;
  totalAmount: Long;
  transfers: Tx11Transfer[];
}

export interface Tx11Transfer {
  recipient: string;
  amount: Long;
}

export type Transaction =
  | Tx1
  | Tx2
  | Tx3
  | Tx4
  | Tx5
  | Tx6
  | Tx7
  | Tx8
  | Tx9
  | Tx10
  | Tx11;
