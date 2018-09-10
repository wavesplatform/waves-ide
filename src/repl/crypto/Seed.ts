import { IKeyPair } from './interface';
import { config } from './config/Config';
import { libs, utils } from '.';
import dictionary from './dictionary';
import { MAINNET_BYTE } from './constants';


export class Seed {

    public readonly phrase: string;
    public readonly address: string;
    public readonly keyPair: IKeyPair;

    constructor(phrase: string, chainId: number = MAINNET_BYTE) {
      const minSeedLen = config.get('minimalSeedLength');
        if (phrase.length < minSeedLen) {
            throw new Error(`Your seed length is less than ${minSeedLen}`);
        }

        const keys = utils.crypto.buildKeyPair(phrase);

        this.phrase = phrase;
        this.address = utils.crypto.buildRawAddress(keys.publicKey, chainId);
        this.keyPair = {
            privateKey: libs.base58.encode(keys.privateKey),
            publicKey: libs.base58.encode(keys.publicKey)
        };

        Object.freeze(this);
        Object.freeze(this.keyPair);
    }

    public encrypt(password: string, encryptionRounds?: number) {
        return Seed.encryptSeedPhrase(this.phrase, password, encryptionRounds);
    }

    public static encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds: number = 5000): string {
        if (password && password.length < 8) {
            // logger.warn('Your password may be too weak');
        }

        if (encryptionRounds < 1000) {
            // logger.warn('Encryption rounds may be too few');
        }

        if (seedPhrase.length < config.get('minimalSeedLength')) {
            throw new Error('The seed phrase you are trying to encrypt is too short');
        }

        return utils.crypto.encryptSeed(seedPhrase, password, encryptionRounds);
    }

    public static decryptSeedPhrase(encryptedSeedPhrase: string, password: string, encryptionRounds: number = 5000): string {

        const wrongPasswordMessage = 'The password is wrong';

        let phrase;

        try {
            phrase = utils.crypto.decryptSeed(encryptedSeedPhrase, password, encryptionRounds);
        } catch (e) {
            throw new Error(wrongPasswordMessage);
        }

        if (phrase === '' || phrase.length < config.get('minimalSeedLength')) {
            throw new Error(wrongPasswordMessage);
        }

        return phrase;

    }

    public static create(words: number = 15): Seed {
        const phrase = Seed._generateNewSeed(words);
        const minimumSeedLength = config.get('minimalSeedLength');

        if (phrase.length < minimumSeedLength) {
            // If you see that error you should increase the number of words in the generated seed
            throw new Error(`The resulted seed length is less than the minimum length (${minimumSeedLength})`);
        }

        return new Seed(phrase);
    }

    public static fromExistingPhrase(phrase: string, chainId: number = MAINNET_BYTE): Seed {
        const minimumSeedLength = config.get('minimalSeedLength');

        if (phrase.length < minimumSeedLength) {
            // If you see that error you should increase the number of words or set it lower in the config
            throw new Error(`The resulted seed length is less than the minimum length (${minimumSeedLength})`);
        }

        return new Seed(phrase, chainId);
    }

    private static _generateNewSeed(length: number): string {

        const random = utils.crypto.generateRandomUint32Array(length);
        const wordCount = dictionary.length;
        const phrase = [];

        for (let i = 0; i < length; i++) {
            const wordIndex = random[i] % wordCount;
            phrase.push(dictionary[wordIndex]);
        }

        random.set(new Uint8Array(random.length));

        return phrase.join(' ');

    }

}
