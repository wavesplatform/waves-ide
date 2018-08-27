export const wavesDocs = `

/**
 * Creates signed issue transaction.
 * @param {string} name - Name of asset, max 16 symbols.
 * @param {string} description - Description of asset, max 1000 symbols.
 * @param {number} decimals - How many decimals your asset will have, range 0-8.
 * @param {number} quantity - The total supply of your token.
 * @param {boolean} reissuable - Re-issuable defines if an asset issuer can increase the token's supply at a later point or not.
 * @param {number} fee - Transaction fee, default: 100000000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function issue(
  name: string,
  description: string,
  decimals: number,
  quantity: number,
  reissuable: boolean,
  fee: number = 100000000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
)

/**
 * Creates signed reissue transaction.
 * @param {string} assetId - Id of earlier issued asset.
 * @param {number} quantity - The total supply of your token (will be added to the old one).
 * @param {boolean} reissuable - Re-issuable defines if an asset issuer can increase the token's supply at a later point or not.
 * @param {number} fee - Transaction fee, default: 100000000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function reissue(
  assetId: string,
  quantity: number,
  reissuable: boolean,
  fee: number = 100000000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
)

/**
 * Creates signed burn transaction.
 * @param {string} assetId - Id of earlier issued asset.
 * @param {number} quantity - Amount to burn.
 * @param {number} fee - Transaction fee, default: 100000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function burn(
  assetId: string,
  quantity: number,
  fee: number = 100000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
) 

/**
 * Creates signed transfer transaction.
 * @param {number} amount - Amount to transfer.
 * @param {string} recipient - Recipient address to transfer funds to.
 * @param {string} assetId - Asset Id to transfer, in case you want to transfer WAVES use default, default: ''.
 * @param {string} attachment - Attachment to transfer, default: ''.
 * @param {number} feeAssetId - Asset Id to pay fee with, in case you want to pay fee with WAVES use default, default: ''.
 * @param {number} fee - Transaction fee, default: 100000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function transfer(
  amount: number,
  recipient: string,
  assetId: string = 'WAVES',
  attachment: string = '',
  feeAssetId: string = 'WAVES',
  fee: number = 100000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
) 
    
/**
 * Creates signed lease transaction.
 * @param {number} amount - Amount to lease.
 * @param {string} recipient - Recipient address to lease to.
 * @param {number} fee - Transaction fee, default: 200000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function lease(
  amount: number,
  recipient: string,
  fee: number = 200000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
)

/**
 * Creates signed lease transaction.
 * @param {number} txId - Id of previous lease transaction.
 * @param {number} fee - Transaction fee, default: 100000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function cancelLease(
  txId: string,
  fee: number = 100000,
  timestamp: number = Date.now(),
  version: number = 1,
  chainId: string = env.CHAIN_ID,
  seed: string = env.SEED
) 

/**
 * Creates signed lease transaction.
 * @param {string} alias - Alias for a sender's address.
 * @param {number} fee - Transaction fee, default: 100000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function createAlias(
  alias: string,
  fee: number = 100000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
) 

/**
 * Creates signed massTransfer transaction.
 * @param {(string | number)[]} transfers - Array of recepients and amounts, example: [100, '3N84Z1vMsHTpFEi6pBh8EdefQCmWLgC5hnH', 200, 'addr2'].
 * @param {string} assetId - Asset Id to transfer, in case you want to transfer WAVES use default, default: ''.
 * @param {number} fee - Transaction fee, default: 200000.
 * @param {number} timestamp - Transaction timestamp, default: Date.now().
 * @param {number} version - Transaction version, default: 1.
 * @param {string} seed - Seed to sign transaction, default: env.SEED.
 */
declare function massTransfer(
  transfers: (string | number)[],
  assetId: string = 'WAVES',
  fee: number = 100000 + 50000 * (transfers.length + 1),
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED)

declare function script(
  script: string,
  fee: number = 1000000,
  timestamp: number = Date.now(),
  version: number = 1,
  seed: string = env.SEED
)

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

declare const contract: string

/**
 * Gets editor contents for tab.
 * @param {string} tabName - Name of the tab to get content from.
 */
declare function file(tabName:string):string

declare function compile(code:string):string

declare function foo(code:{name: string, age:number}):string

`