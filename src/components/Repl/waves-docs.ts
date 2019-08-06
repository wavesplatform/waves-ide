export const wavesDocs = `

/**
 * Creates signed issue transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function issue(txParams: {
  /** 
   * Name of asset, max 16 symbols 
   */
  name: string,
  /** 
   * Description of asset, max 1000 symbols  
   */
  description: string,
  /** 
   * How many decimals your asset will have, range 0-8
   */
  decimals: number,
  /** 
   * The total supply of your token
   */
  quantity: number,
  /** 
   * Re-issuable defines if an asset issuer can increase the token's supply at a later point or not
   */
  reissuable: boolean,
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000000
   */
  fee?: number,
  /** 
   * Transaction version, default: 2
   */
  version?: number,
  /** 
   * Network byte, default env.CHAIN_ID
   */
  chainId?: string
},  seed?: string)

/**
 * Creates signed reissue transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function reissue(txParams: {
  /** 
   * Id of earlier issued asset
   */
  assetId: string,
  /** 
   * The total supply of your token (will be added to the old one)
   */
  quantity: number,
  /** 
   * Re-issuable defines if an asset issuer can increase the token's supply at a later point or not
   */
  reissuable: boolean,
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000000
   */
  fee?: number,
  /** 
   * version - Transaction version, default: 2
   */
  version?: number
  /** 
   * Network byte, default env.CHAIN_ID
   */
  chainId?: string
}, seed?: string)

/**
 * Creates signed burn transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function burn(txParams: {
  /** 
   * Id of earlier issued asset
   */
  assetId: string,
 /** 
   * Amount to burn
   */
  quantity: number,
   /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000
   */
  fee?: number,
  /** 
   * version - Transaction version, default: 1
   */
  version?: number
}, seed?: string) 

/**
 * Creates signed transfer transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function transfer(txParams: {
  /** 
   * Amount to transfer in minimal units. E.x. for waves 100000000 equals 1.0 Waves
   */
  amount: number,
  /** 
   * Recipient address to transfer funds to
   */
  recipient: string,
  /** 
   *  Asset Id to transfer, in case you want to transfer WAVES use default, default: ''
   */
  assetId?: string,
  /** 
   * Attachment to transfer, default: ''
   */
  attachment?: string = '',
  /** 
   * Asset Id to pay fee with, in case you want to pay fee with WAVES use default, default: ''
   */
  feeAssetId?: string = 'WAVES',
   /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000.
   */
  fee?: number = 100000,
  /** 
   * Transaction version, default: 1
   */
  version?: number = 1
},   seed?: string) 
    
/**
 * Creates signed lease transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function lease(txParams: {
  /** 
   * Amount to lease
   */
  amount: number,
  /** 
   * Recipient address to lease to
   */
  recipient: string,
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 200000.
   */
  fee?: number = 200000,
  /** 
   * Transaction version, default: 1.
   */
  version?: number = 1
},  seed: string = env.SEED)

/**
 * Creates signed cancelLease transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function cancelLease(txParams: {
  /** 
   * Id of previous lease transaction
   */
    leaseId: string,
   /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
   /** 
   * Transaction fee, default: 100000
   */
    fee?: number,
  /** 
   * Network byte, default env.CHAIN_ID
   */
  chainId?: string
},  seed: string = env.SEED) 

/**
 * Creates signed createAlias transaction. Not implemented
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function alias(txParams:{
  /** 
   * Alias for a sender's address.
   */
   alias: string,
   /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000
   */
   fee?: number,
   /** 
   * Network byte, default env.CHAIN_ID
   */
  chainId?: string
}, seed: string = env.SEED ) 

/**
 * Creates signed massTransfer transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function massTransfer(txParams: {
  /** 
   *Array of objects representing transfer. Contains recipient and amount field
   */
  transfers: {recipient: string, amount:number}[],
  /** 
   * Asset Id to transfer, in case you want to transfer WAVES use default, default: ''
   */
  assetId: string = 'WAVES',
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 100000 + 50000 * (transfers.length + 1)
   */
  fee?: number = 100000 + 50000 * (transfers.length + 1),
  /** 
   * Transaction version, default: 1
   */
  version?: number = 1
 }, seed: string = env.SEED)

/**
 * Creates signed setScript transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function setScript(txParams: {
  /** 
   * Compiled script in base64 format
   */
  script: string,
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: 1000000
   */
  fee?: number = 1000000,
  /** 
   * Transaction version, default: 1
   */
  version?: number = 1,
  /** 
   * Network byte, default env.CHAIN_ID
   */
  chainId?: string
}, seed: string = env.SEED)



/**
 * Creates signed data transaction.
 * @param {Object} txParams - Transaction parameters
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function data(txParams: {
  /** 
   * Array of data entries: {key:string, value:  string | number | boolean | Buffer | Uint8Array | number[]}
   */
  data: [],
  /** 
   * Account public key from which this tx should be sent. Default to the one who signs tx
   */
  senderPublicKey?: string,
  /** 
   * Transaction fee, default: Math.floor(1 + (bytes.length + 8 - 1) / 1024) * 100000)
   */
  fee?: number,
  /** 
   * Transaction version, default: 1
   */
  version?: number = 1,
}, seed: string = env.SEED)


/**
 * Sends transaction to the Waves network using env.API_BASE endpoint.
 * @param {any} tx - Transaction to send to the network.
 */
declare function broadcast(tx: any)

/**
 * Generates keyPair from seed.
 * @param {string} seed - Seed used to generate keyPair, default: env.SEED.
 */
declare function keyPair(seed: string = env.SEED): KeyPair

/**
 * Generates publicKey from seed.
 * @param {string} seed - Seed used to generate publicKey, default: env.SEED.
 */
declare function publicKey(seed: string = env.SEED): string

/**
 * Generates privateKey from seed.
 * @param {string} seed - Seed used to generate privateKey, default: env.SEED.
 */
declare function privateKey(seed: string = env.SEED): string

/**
 * Generates address from KeyPair or Seed.
 * @param {string} keyPairOrSeed - KeyPair or Seed used to generate address, default: env.SEED.
 */
declare function address(keyPairOrSeed: KeyPair | string = env.SEED)

declare const env: {
  SEED: string,
  API_BASE: string,
  CHAIN_ID: string
}

/**
 * Open editor tab content
 */
declare function contract(): string

/**
 * Gets editor contents for tab.
 * @param {string} tabName - Name of the tab to get content from.
 */
declare function file(tabName:string):string

/**
 * Gets editor contents for tab.
 * @param {string} code - Contract code
 */
declare function compile(code:string):string

`