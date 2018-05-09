export const txFields = [
  'type',
  'id',
  'fee',
  'feeAssetId',
  'timestamp',
  'amount',
  'bodyBytes',
  'senderPk',
  'aliasText',
  'assetName',
  'assetDescription',
  'attachment',
  'decimals',
  'chainId',
  'version',
  'reissuable',
  'proof0',
  'proof1',
  'proof2',
  'proof3',
  'proof4',
  'proof5',
  'proof6',
  'proof7',
  'transferAssetId',
  'assetId',
  'recipient',
  'minSponsoredAssetFee',
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
    label: 'base58',
    kind,
    insertText: {
      value: `base58'$0'`,
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

]