import * as vm from 'vm'
import * as fs from 'fs'

const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js', { encoding: 'utf8' })

const box = { base58Decode: (a) => [1, 2, 3] }
vm.runInNewContext(code, box)


console.log(box)

const c = box.compile(`

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

`)

console.log(JSON.stringify(c.ast))