import * as vm from 'vm'
import * as fs from 'fs'
import * as Base58 from '../src/base58'
import * as blake from '../src/blake2b'
import { keccak256 } from '../src/sha3'

function bufferToBase64(buf) {
  var binstr = Array.prototype.map.call(buf, function (ch) {
    return String.fromCharCode(ch);
  }).join('')
  return btoa(binstr)
}

const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-opt.js', { encoding: 'utf8' })

const box: any = {}
vm.runInNewContext(code, box)

box['base58Encode'] = (bytes: ArrayBuffer): string => {
  return Base58.encode(new Uint8Array(bytes))
}
box['base58Decode'] = (data: string): ArrayBuffer => {
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

const c = box.compile(`
true
`)

console.log(bufferToBase64(new Uint8Array(c.result).buffer))
