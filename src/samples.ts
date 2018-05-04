export const codeSamples: {
  [id: string]: string
} = {
    simple: `
let publicKey = base58'7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy'
let heightBefore = 100
let AC = sigVerify(tx.bodyBytes, tx.proof0, publicKey)
let heightVerification = height > heightBefore + 10
AC && heightVerification
`,
    multisig: `
let alicePubKey  = base58'B1Yz7fH1bJ2gVDjyJnuyKNTdMFARkKEpV'
let bobPubKey    = base58'7hghYeWtiekfebgAcuCg9ai2NXbRreNzc'
let cooperPubKey = base58'BVqYXrapgJP9atQccdBPAgJPwHDKkh6A8'

let aliceSigned  = if(sigVerify(tx.bodyBytes, tx.proof0, alicePubKey  )) then 1 else 0
let bobSigned    = if(sigVerify(tx.bodyBytes, tx.proof1, bobPubKey    )) then 1 else 0
let cooperSigned = if(sigVerify(tx.bodyBytes, tx.proof2, cooperPubKey )) then 1 else 0

aliceSigned + bobSigned + cooperSigned >= 2
`,
    notary: `
let king = extract(addressFromString("kingAddress"))
let company = extract(addressFromString("companyAddress"))
let notary1 = addressFromPublicKey(extract(getByteArray(king,"notary1PK")))
let txIdBase58String = toBase58String(tx.id)
let notary1Agreement = getBoolean(notary1,txIdBase58String)
let isNotary1Agreed = if(isDefined(notary1Agreement)) then extract(notary1Agreement) else false
let recipientAddress = addressFromRecipient(tx.recipient)
let recipientAgreement = getBoolean(recipientAddress,txIdBase58String)
let isRecipientAgreed = if(isDefined(recipientAgreement)) then extract(recipientAgreement) else false
let senderAddress = addressFromPublicKey(tx.senderPk)
senderAddress.bytes == company.bytes || (isNotary1Agreed && isRecipientAgreed)
`
  }