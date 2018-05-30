import * as vm from 'vm'
import * as fs from 'fs'
import * as Base58 from '../src/base58'
import * as blake from '../src/blake2b'
import { keccak256 } from '../src/sha3'

const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js', { encoding: 'utf8' })

const box: any = {}
vm.runInNewContext(code, box)

box['base58Encode'] = (bytes: ArrayBuffer): string => {
  const c = Base58.encode(new Uint8Array(bytes))
  //console.log(c)
  return c
}
box['base58Decode'] = (data: string): ArrayBuffer => {
  return Base58.decode(data).buffer
}
box['keccak256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  return keccak(new Uint8Array(bytes)).buffer
}
box['blake2b256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  //console.log(new Uint8Array(bytes))
  const c = blake2b(new Uint8Array(bytes)).buffer
  return c
}

function blake2b(input: Uint8Array) {
  return blake.blake2b(input, null, 32)
}

function keccak(input: Uint8Array) {
  return (keccak256 as any).array(input)
}

const c = box.compile(`

let alicePubKey  = base58'B1Yz7fH1bJ2gVDjyJnuyKNTdMFARkKEpV'
let bobPubKey    = base58'7hghYeWtiekfebgAcuCg9ai2NXbRreNzc'
let cooperPubKey = base58'BVqYXrapgJP9atQccdBPAgJPwHDKkh6A8'

let aliceSigned  = if(sigVerify(tx.bodyBytes, tx.proofs[0], alicePubKey  )) then 1 else 0
let bobSigned    = if(sigVerify(tx.bodyBytes, tx.proofs[1], bobPubKey    )) then 1 else 0
let cooperSigned = if(sigVerify(tx.bodyBytes, tx.proofs[2], cooperPubKey )) then 1 else 0

aliceSigned + bobSigned + cooperSigned >= 2

`)

console.log(c)
