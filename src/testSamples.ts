export type sampleTypes = 'basic';

export const testSamples: {
    [id in sampleTypes]: string
} = {
    basic: `
// This is example test file. 
// Tests are run via 'mocha' library 

// You can write singe test using 'it' syntax
it('Is single test', async function(){
      this.timeout(0)
    // All functions available in console are also available in tests
    // E.g.: transaction creating functions
    const ttx = transfer({ amount: 1000, recipient: address() })
    // Or broadcast function
    await broadcast(ttx)
})
// You can define test suites with 'describe' syntax
describe('My first test suite', () => {
    // And define tests inside suites
    it('Waits for tx to be mined in block', async function(){
        // Create transfer tx. Note that we invoke 'address' function 
        // without parameters to get address of current account
        const ttx = transfer({ amount: 1000, recipient: address() })

        // For broadcast to succeed selected account needs to have some waves
        await broadcast(ttx)

        // There is special waitForTx function that waits
        // for transaction to be mined in block. 
        // Optional timeout can be passed as second argument.
        // Default timeout is 20 seconds
        await waitForTx(ttx.id)
    })
    // As you can see, we can use async functions to write async tests
    // async functions have default timeout = 20s
    it('Zero timeout example', async function(){
        // You can set timeout. If you set it to zero, test won't finish untill function resolves
        this.timeout(0)
        const ttx = transfer({ amount: 1000, recipient: address()})

        // Console methods avalilable in test. Everything will be printed in repl
        console.log(ttx)
        console.error(ttx)
    })
    // Test don't have to be async if not needed
    it('Sync chai test', function(){
        const ttx = transfer({ amount: 1000, recipient: address()})

        // chai assertion library available in global scope
        chai.expect(ttx.proofs.length).to.equal(1)
    })
})
`
};
