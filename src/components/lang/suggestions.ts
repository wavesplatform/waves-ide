export const txFields = [
    'id',
    'fee',
    'feeAssetId',
    'timestamp',
    'amount',
    'bodyBytes',
    'sender',
    'quantity',
    'name',
    'description',
    'script',
    'leaseId',
    "buyOrder",
    "sellOrder",
    "price",
    "amount",
    "buyMatcherFee",
    "sellMatcherFee",
    'totalAmount',
    'transfers',
    'transferCount',
    'senderPublicKey',
    'alias',
    'data',
    'assetName',
    'assetDescription',
    'attachment',
    'decimals',
    'chainId',
    'version',
    'reissuable',
    'proofs',
    'transferAssetId',
    'assetId',
    'recipient',
    'minSponsoredAssetFee',
]

export const txTypes = [
    'TransferTransaction',
    'IssueTransaction',
    'ReissueTransaction',
    'BurnTransaction',
    'LeaseTransaction',
    'LeaseCancelTransaction',
    'MassTransferTransaction',
    'CreateAliasTransaction',
    'SetScriptTransaction',
    'SponsorFeeTransaction',
    'ExchangeTransaction',
    'DataTransaction',
]

export const generalSuggestions = (kind) => [
    {
        label: 'ifelse',
        kind,
        insertText: {
            value: 'if (${1:condition}) then $2 else $3',
        },
    },
    {
        label: 'match',
        kind,
        insertText: {
            value: `match (\${1:obj}) {
  case $1:\${2:type} => $0
  case _ =>
}`,
        },
    },
    {
        label: 'base58',
        kind,
        insertText: {
            value: `base58'$0'`,
        },
    }, {
        label: 'base64',
        kind,
        insertText: {
            value: `base64'$0'`,
        },
    },
]

export const cryptoFunctions = (kind) => [
    {
        label: 'keccak256',
        kind,
        insertText: {
            value: 'keccak256(${0:BYTE_VECTOR})',
        },
        detail: "Computes the keccak 256 bit hash"
    },
    {
        label: 'blake2b256',
        kind,
        insertText: {
            value: 'blake2b256(${0:BYTE_VECTOR})',
        },
        detail: "Computes the blake2b 256 bit hash"
    },
    {
        label: 'sha256',
        kind,
        insertText: {
            value: 'sha256(${0:BYTE_VECTOR})',
        },
        detail: "Computes the sha 256 bit hash"
    },
    {
        label: 'sigVerify',
        kind,
        insertText: {
            value: 'sigVerify(${1:bytes: BYTE_VECTOR}, ${2:signature: BYTE_VECTOR}, ${3:publicKey: BYTE_VECTOR})',
        },
        detail: "Validated signature for bytes and public key",
    },
    {
        label: 'toBase58String',
        kind,
        insertText: {
            value: 'toBase58String(${1:bytes: BYTE_VECTOR})',
        },
        detail: "Encodes bytearray to base58 string",
    },
    {
        label: 'fromBase58String',
        kind,
        insertText: {
            value: 'fromBase58String(${1:string: STRING})',
        },
        detail: "Decodes base58 string",
    },
    {
        label: 'toBase64String',
        kind,
        insertText: {
            value: 'toBase64String(${1:bytes: BYTE_VECTOR})',
        },
        detail: "Encodes bytearray to base64 string",
    },
    {
        label: 'fromBase64String',
        kind,
        insertText: {
            value: 'fromBase64String(${1:string: STRING})',
        },
        detail: "Decodes base64 string",
    },
]

export const contextFields = (kind) => [
    {
        label: 'height',
        kind,
        insertText: {
            value: 'height',
        },
        detail: "Retrieves current blockchain height",
    },
    {
        label: 'tx',
        kind,
        insertText: {
            value: 'tx',
        },
        detail: "Retrieves current transaction being processed",
    },
]

export const contextFunctions = (kind) => [
    {
        label: 'transactionById',
        kind,
        insertText: {
            value: 'transactionById(${1:transactionId: BYTE_VECTOR})',
        },
        detail: "Retrieves transaction by it's id",
    },
    {
        label: 'transactionHeightById',
        kind,
        insertText: {
            value: 'transactionHeightById(${1:transactionId: BYTE_VECTOR})',
        },
        detail: "Retrieves transaction's height by it's id",
    },
    {
        label: 'addressFromRecipient',
        kind,
        insertText: {
            value: 'addressFromRecipient(${1:recipient: Obj(bytes)})',
        },
        detail: "Retrieves adress from recipient obj",
    },
    {
        label: 'addressFromString',
        kind,
        insertText: {
            value: 'addressFromString(${1:base58})',
        },
        detail: "Retrieves adress from base58 string",
    },
    {
        label: 'addressFromPublicKey',
        kind,
        insertText: {
            value: 'addressFromPublicKey(${1:publicKey: BYTE_VECTOR})',
        },
        detail: "Retrieves adress from publicKey bytes",
    },
    {
        label: 'wavesBalance',
        kind,
        insertText: {
            value: 'wavesBalance(${1:addressOrAlias: Obj(bytes)})',
        },
        detail: "Returns waves balance for address or alias",
    },
    {
        label: 'assetBalance',
        kind,
        insertText: {
            value: 'assetBalance(${1:addressOrAlias: Obj(bytes)}, ${2:assetId: BYTE_VECTOR})',
        },
        detail: "Returns asset balance for address or alias",
    },
    {
        label: 'getInteger',
        kind,
        insertText: {
            value: 'getInteger(${1:address: Obj(bytes)}, ${2:key: STRING})',
        },
        detail: "Gets integer value by key from address data table",
    },
    {
        label: 'getBoolean',
        kind,
        insertText: {
            value: 'getBoolean(${1:address: Obj(bytes)}, ${2:key: STRING})',
        },
        detail: "Gets boolean value by key from address data table",
    },
    {
        label: 'getBinary',
        kind,
        insertText: {
            value: 'getBinary(${1:address: Obj(bytes)}, ${2:key: STRING})',
        },
        detail: "Gets bytevector value by key from address data table",
    },
    {
        label: 'getString',
        kind,
        insertText: {
            value: 'getString(${1:address: Obj(bytes)}, ${2:key: STRING})',
        },
        detail: "Gets string value by key from address data table ",
    },
    {
        label: 'getInteger',
        kind,
        insertText: {
            value: 'getInteger(${1:data: DATA_TX.DATA}, ${2:key: STRING})',
        },
        detail: "Gets integer value by key from data tx",
    },
    {
        label: 'getBoolean',
        kind,
        insertText: {
            value: 'getBoolean(${1:data: DATA_TX.DATA}, ${2:key: STRING})',
        },
        detail: "Gets boolean value by key from data tx",
    },
    {
        label: 'getBinary',
        kind,
        insertText: {
            value: 'getBinary(${1:data: DATA_TX.DATA}, ${2:key: STRING})',
        },
        detail: "Gets bytevector value by key from data tx",
    },
    {
        label: 'getString',
        kind,
        insertText: {
            value: 'getString(${1:data: DATA_TX.DATA}, ${2:key: STRING})',
        },
        detail: "Gets string value by key from from data tx",
    },    {
        label: 'getInteger',
        kind,
        insertText: {
            value: 'getInteger(${1:data: DATA_TX.DATA}, ${2:index: LONG})',
        },
        detail: "Gets integer value by index from data tx",
    },
    {
        label: 'getBoolean',
        kind,
        insertText: {
            value: 'getBoolean(${1:data: DATA_TX.DATA}, ${2:index: LONG})',
        },
        detail: "Gets boolean value by index from data tx",
    },
    {
        label: 'getBinary',
        kind,
        insertText: {
            value: 'getBinary(${1:data: DATA_TX.DATA}, ${2:index: LONG})',
        },
        detail: "Gets bytevector value by index from data tx",
    },
    {
        label: 'getString',
        kind,
        insertText: {
            value: 'getString(${1:data: DATA_TX.DATA}, ${2:index: LONG})',
        },
        detail: "Gets string value by index from from data tx",
    },

    /// From PureContext.scala
    {
        label: 'fraction',
        kind,
        insertText: {
            value: 'fraction(${1:value: LONG}, ${2:numerator: LONG}, ${3:denominator: LONG})',
        },
        detail: "Multiplies value by numerator and divides by denominator",
    },
    {
        label: 'size',
        kind,
        insertText: {
            value: 'size(${1:byteVector: BYTE_VECTOR|STRING})',
        },
        detail: "Returns size of byte vector or string",
    },
    {
        label: 'toBytes',
        kind,
        insertText: {
            value: 'size(${1:value: BOOLEAN|STRING|LONG})',
        },
        detail: "Converts boolean or string or long to byte vector",
    },
    {
        label: 'take',
        kind,
        insertText: {
            value: 'take(${1:value: BYTE_VECTOR|STRING}, ${2:n: LONG})',
        },
        detail: "Takes first n bytes or characters",
    },
    {
        label: 'drop',
        kind,
        insertText: {
            value: 'drop(${1:value: BYTE_VECTOR|STRING}, ${2:n: LONG})',
        },
        detail: "Drops first n bytes or characters",
    },
    {
        label: 'takeRight',
        kind,
        insertText: {
            value: 'takeRight(${1:value: BYTE_VECTOR|STRING}, ${2:n: LONG})',
        },
        detail: "Takes last n bytes or characters",
    },
    {
        label: 'dropRight',
        kind,
        insertText: {
            value: 'dropRight(${1:value: BYTE_VECTOR|STRING}, ${2:n: LONG})',
        },
        detail: "Drops last n bytes or characters",
    },
    {
        label: 'toString',
        kind,
        insertText: {
            value: 'toString(${1:value: BOOLEAN|LONG})',
        },
        detail: "Converts boolean or long to string",
    },
    {
        label: 'isDefined',
        kind,
        insertText: {
            value: 'isDefined(${1:value: UNION(SOMETHING|UNIT)})',
        },
        detail: "Checks if UNION contains value",
    },
    {
        label: 'extract',
        kind,
        insertText: {
            value: 'extract(${1:value: UNION(SOMETHING|UNIT)})',
        },
        detail: "Extracts value from union. Throws if value is unit",
    },
    {
        label: 'throw',
        kind,
        insertText: {
            value: 'extract(${1:err: STRING?})',
        },
        detail: "Throws exception. Explicit script termination",
    },
]