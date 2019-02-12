import {describe, it} from "mocha"
import {expect} from "chai"
import {multisig} from '../src/contractGenerators'
import {safeCompile} from '../src/utils/safeCompile'

describe('Multisig generator', () => {
    it('Should generate 2 of 3 contract', () => {
        const pks = [
            '5AzfA9UfpWVYiwFwvdr77k6LWupSTGLb14b24oVdEpMM',
            '2KwU4vzdgPmKyf7q354H9kSyX9NZjNiq4qbnH2wi2VDF',
            'GbrUeGaBfmyFJjSQb9Z8uTCej5GzjXfRDVGJGrmgt5cD'
        ]
        const contract = multisig(pks, 2);
        const compiled = safeCompile(contract);
        expect(compiled.error).to.be.undefined;
        expect(contract.split('\n').length).to.eql(2 * pks.length + 1)
    });

    it('Should throw if more than 8 pk provided', () => {
        const pks = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        expect(() => multisig(pks,1)).to.throw('Cannot create contract. N > 8')
    });

    it('Should throw if M > N ', () => {
        const pks = ['1', '2', '3'];
        expect(() => multisig(pks,4)).to.throw('Cannot create contract. M > N')
    })
})

// const code = `
//     describe('Object test', () => {
//         it('Should return false', () => {
//             const object = {a: 1};
//             chai.expect(object).to.have.own.property('b');
//         });

//         it('Should return true', () => {
//             const object = {a: 1};
//             chai.expect(object).to.have.own.property('a');
//         });
//     })
// `;