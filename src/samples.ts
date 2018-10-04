export type sampleTypes = 'simple' | 'multisig' | 'notary'

export const codeSamples: {
  [id in sampleTypes]: string
} = {
  simple: `
let publicKey = base58'7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy'
let heightBefore = 100
let AC = sigVerify(tx.bodyBytes, tx.proofs[0], publicKey)
let heightVerification = height > heightBefore + 10
AC && heightVerification
`,
  multisig: `
#define public keys
let alicePubKey  = base58'5AzfA9UfpWVYiwFwvdr77k6LWupSTGLb14b24oVdEpMM'
let bobPubKey    = base58'2KwU4vzdgPmKyf7q354H9kSyX9NZjNiq4qbnH2wi2VDF'
let cooperPubKey = base58'GbrUeGaBfmyFJjSQb9Z8uTCej5GzjXfRDVGJGrmgt5cD'

#check whoever provided the valid proof
let aliceSigned  = if(sigVerify(tx.bodyBytes, tx.proofs[0], alicePubKey  )) then 1 else 0
let bobSigned    = if(sigVerify(tx.bodyBytes, tx.proofs[1], bobPubKey    )) then 1 else 0
let cooperSigned = if(sigVerify(tx.bodyBytes, tx.proofs[2], cooperPubKey )) then 1 else 0

#sum up every valid proof to get at least 2
aliceSigned + bobSigned + cooperSigned >= 2
`,
  notary: `
let king = extract(addressFromString("kingAddress"))
let company = extract(addressFromString("companyAddress"))
let notary1 = addressFromPublicKey(extract(getBinary(king,"notary1PK")))
let txIdBase58String = toBase58String(tx.id)
let notary1Agreement = getBoolean(notary1,txIdBase58String)
let isNotary1Agreed = if(isDefined(notary1Agreement)) then extract(notary1Agreement) else false
match tx { 
  case t:TransferTransaction =>
    let recipientAddress = addressFromRecipient(t.recipient)
    let recipientAgreement = getBoolean(recipientAddress,txIdBase58String)
    let isRecipientAgreed = if(isDefined(recipientAgreement)) then extract(recipientAgreement) else false
    let senderAddress = addressFromPublicKey(t.senderPublicKey)
    senderAddress.bytes == company.bytes || (isNotary1Agreed && isRecipientAgreed)
  case _ => false
}
`
}