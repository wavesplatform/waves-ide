import * as Base58 from "./base58"
import * as blake from './blake2b'
import { keccak256 } from './sha3'

window['base58Encode'] = (bytes: number[]): string => {
  return Base58.encode(Uint8Array.from(bytes))
}
window['base58Decode'] = (data: string): number[] => {
  return Array.from(Base58.decode(data))
}
window['keccak256'] = (bytes: number[]): number[] => {
  return keccak(bytes)
}
window['blake2b256'] = (bytes: number[]): number[] => {
  return Array.from(blake2b(bytes))
}

function blake2b(input: number[]) {
  return blake.blake2b(Uint8Array.from(input), null, 32)
}

function keccak(input) {
  return (keccak256 as any).array(input)
}

// function blake2b(input: number[]) {
//   const c = blake.blake2b(Uint8Array.from(input), null, 32)
//   return Array.from(c).map(x => x > 127 ? x - 256 : x)
// }

// function keccak(input) {
//   const c = (keccak256 as any).array(input)
//   return Array.from(c).map((x: number) => x > 127 ? x - 256 : x)
// }
