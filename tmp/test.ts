import * as vm from 'vm'
import * as fs from 'fs'
import "/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js"


const code = fs.readFileSync('/Users/ebceu4/git/Waves/lang/js/target/lang-fastopt.js', { encoding: 'utf8' })

const box = { exports: { }, base58Decode: (a) => [1, 2, 3] }
vm.runInNewContext(code, box)

console.log(box.exports)

const c = box.exports.compile(`
let a = base58'4ZbbmLTxWHRgSzxiStXVkExy2YZQYNUjSYPrR5o3nawK41DsEJw4Xzqt8kupJYikM21rihExoFPBzhNag5L1s1XH'
true
`)
console.log(c)