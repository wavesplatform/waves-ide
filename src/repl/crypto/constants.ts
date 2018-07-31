export const enum TRANSACTION_TYPE_NUMBER {
    SEND_OLD = 2,
    ISSUE = 3,
    TRANSFER = 4,
    REISSUE = 5,
    BURN = 6,
    EXCHANGE = 7,
    LEASE = 8,
    CANCEL_LEASING = 9,
    CREATE_ALIAS = 10,
    MASS_TRANSFER = 11,
    DATA = 12,
    SET_SCRIPT = 13,
    SPONSORSHIP = 14
}

export const enum TRANSACTION_TYPE {
    ISSUE = 'issue',
    TRANSFER = 'transfer',
    REISSUE = 'reissue',
    BURN = 'burn',
    EXCHANGE = 'exchange',
    LEASE = 'lease',
    CANCEL_LEASING = 'cancelLeasing',
    CREATE_ALIAS = 'createAlias',
    MASS_TRANSFER = 'massTransfer',
    DATA = 'data',
    SET_SCRIPT = 'setScript',
    SPONSORSHIP = 'sponsorship'
}

export const enum TRANSACTION_TYPE_VERSION {
    ISSUE = 2,
    TRANSFER = 2,
    REISSUE = 2,
    BURN = 2,
    EXCHANGE = 2,
    LEASE = 2,
    CANCEL_LEASING = 2,
    CREATE_ALIAS = 2,
    MASS_TRANSFER = 1,
    DATA = 1,
    SET_SCRIPT = 1,
    SPONSORSHIP = 1
}

export const WAVES_ID = 'WAVES';
export const WAVES_BLOCKCHAIN_ID = '';

export const MAINNET_BYTE: number = 'W'.charCodeAt(0);
export const TESTNET_BYTE: number = 'T'.charCodeAt(0);

export const ADDRESS_VERSION: number = 1;
export const ALIAS_VERSION: number = 2;

export const TRANSFER_ATTACHMENT_BYTE_LIMIT: number = 140;
export const DATA_TX_SIZE_WITHOUT_ENTRIES = 52;
export const DATA_ENTRIES_BYTE_LIMIT: number = 140 * 1024 - DATA_TX_SIZE_WITHOUT_ENTRIES; // 140 kb for the whole tx

export const INITIAL_NONCE: number = 0;
export const PRIVATE_KEY_LENGTH: number = 32;
export const PUBLIC_KEY_LENGTH: number = 32;

// That is to mark ByteProcessor instances which cannot be affected by user
export const STUB_NAME = 'reservedName';
