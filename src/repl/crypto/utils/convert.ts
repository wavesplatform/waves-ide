import { TBuffer } from '../interface';
import BigNumber from 'bignumber.js';
import converters from '../libs/converters';


function performBitwiseAnd(a: BigNumber, b: BigNumber): number {
    const sa = a.toString(2).split('.')[0];
    const sb = b.toString(2).split('.')[0];
    const len = Math.min(sa.length, sb.length);

    const s1 = sa.slice(sa.length - len);
    const s2 = sb.slice(sb.length - len);

    let result = new Array(len);
    for (let i = len - 1; i >= 0; i--) {
        result[i] = (s1[i] === '1' && s2[i] === '1') ? '1' : '0';
    }

    return parseInt(result.join(''), 2);
}


export default {

    booleanToBytes(input: boolean): number[] {

        if (typeof input !== 'boolean') {
            throw new Error('Boolean input is expected');
        }

        return input ? [1] : [0];

    },

    shortToByteArray(input: number): number[] {

        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }

        return converters.int16ToBytes(input, true);

    },

    bytesToByteArrayWithSize(input: TBuffer): number[] {

        if (!(input instanceof Array || input instanceof Uint8Array)) {
            throw new Error('Byte array or Uint8Array input is expected');
        } else if (input instanceof Array && !(input.every((n) => typeof n === 'number'))) {
            throw new Error('Byte array contains non-numeric elements');
        }

        if (!(input instanceof Array)) {
            input = Array.prototype.slice.call(input);
        }

        const lengthBytes = converters.int16ToBytes(input.length, true);
        return [...lengthBytes, ...input as Array<number>];

    },

    longToByteArray(input: number): number[] {

        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }

        const bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = input & (255);
            input = input / 256;
        }

        return bytes;

    },

    bigNumberToByteArray(input: BigNumber): number[] {

        if (!(input instanceof BigNumber)) {
            throw new Error('BigNumber input is expected');
        }

        const performBitwiseAnd255 = performBitwiseAnd.bind(null, new BigNumber(255));

        const bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = performBitwiseAnd255(input);
            input = input.div(256);
        }

        return bytes;

    },

    stringToByteArray(input: string): number[] {

        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }

        return converters.stringToByteArray(input);

    },

    stringToByteArrayWithSize(input: string): number[] {

        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }

        const stringBytes = converters.stringToByteArray(input);
        const lengthBytes = converters.int16ToBytes(stringBytes.length, true);

        return [...lengthBytes, ...stringBytes];

    }

};
