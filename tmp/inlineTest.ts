import * as vm from 'vm'
import * as fs from 'fs'
import * as Base58 from '../src/base58'
import * as blake from '../src/blake2b'
import { keccak256 } from '../src/sha3'
import { codeSamples } from '../src/samples'

const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js', { encoding: 'utf8' })

const box: any = {}
vm.runInNewContext(code, box)

box['base58Encode'] = (bytes: ArrayBuffer): string => {
  return Base58.encode(new Uint8Array(bytes))
}
box['base58Decode'] = (data: string): ArrayBuffer => {
  return Base58.decode(data).buffer
}
box['base64Encode'] = (bytes: ArrayBuffer): string => {
  console.log('base64Encode')
  return Base58.encode(new Uint8Array(bytes))
}
box['base64Decode'] = (data: string): ArrayBuffer => {
  console.log('base64Decode')
  return Base58.decode(data).buffer
}
box['keccak256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  return Uint8Array.from(keccak(new Uint8Array(bytes))).buffer
}
box['blake2b256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  return blake2b(new Uint8Array(bytes)).buffer
}

function blake2b(input: Uint8Array) {
  return blake.blake2b(input, null, 32)
}

function keccak(input: Uint8Array) {
  return (keccak256 as any).array(input)
}

const a = box.compile(codeSamples.simple)
const b = box.compile(codeSamples.multisig)
const c = box.compile(codeSamples.notary)

console.log(a)
console.log(b)
console.log(c)
