import * as vm from 'vm'
import * as fs from 'fs'
import * as Base58 from '../src/base58'
import * as blake from '../src/blake2b'
import { keccak256 } from '../src/sha3'

const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js', { encoding: 'utf8' })

const box: any = {}
vm.runInNewContext(code, box)

box['base58Encode'] = (bytes: number[]): string => {
  return Base58.encode(Uint8Array.from(bytes))
}
box['base58Decode'] = (data: string): number[] => {
  return Array.from(Base58.decode(data))
}
box['keccak256'] = (bytes: number[]): number[] => {
  return Array.from(keccak(bytes))
}
box['blake2b256'] = (bytes: number[]): number[] => {
  return Array.from(blake2b(bytes))
}
function blake2b(input: number[]) {
  const c = blake.blake2b(Uint8Array.from(input), null, 32)
  return Array.from(c)//.map(x => x > 127 ? x - 256 : x)
}

function keccak(input) {
  const c = (keccak256 as any).array(input)
  return c//.map((x: number) => x > 127 ? x - 256 : x)
}


const c = box.compile(`
true

`)

console.log(JSON.stringify(c))