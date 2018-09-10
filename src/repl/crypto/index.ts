export * from './constants';
export * from './interface';
export * from './byteProcessor/ByteProcessor';
export * from './config/Config';
export * from './config/interface';
export * from './signatureFactory/interface';
export * from './signatureFactory/SignatureFactory';
export * from './Seed';
export * from './dictionary';

import base58 from './libs/base58';
import converters from './libs/converters';
import axlsign from './libs/axlsign';
import * as blake2b from './libs/blake2b';
import { keccak256 } from './libs/sha3';
import secureRandom from './libs/secure-random';

import { concatUint8Arrays } from './utils/concat';
import convert from './utils/convert';
import crypto from './utils/crypto';

export const libs = {
    base58,
    converters,
    axlsign,
    blake2b,
    secureRandom,
    keccak256
};

export const utils = {
    concatUint8Arrays,
    convert,
    crypto
};
