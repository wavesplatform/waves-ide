import * as Base58 from "./base58"
import * as blake from './blake2b'
import { keccak256 } from './sha3'

window['base58Encode'] = (bytes: ArrayBuffer): string => {
  return Base58.encode(new Uint8Array(bytes))
}
window['base58Decode'] = (data: string): ArrayBuffer => {
  return Base58.decode(data).buffer
}
window['keccak256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  return keccak(new Uint8Array(bytes)).buffer
}
window['blake2b256'] = (bytes: ArrayBuffer): ArrayBuffer => {
  return blake2b(new Uint8Array(bytes)).buffer
}

function blake2b(input: Uint8Array) {
  return blake.blake2b(input, null, 32);
}

function keccak(input: Uint8Array) {
  return (keccak256 as any).array(input);
}