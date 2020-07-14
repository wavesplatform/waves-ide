import axios from 'axios';
import Base58 from './base58';

export const validatePublicKey = (publicKey: string) => {
    try {
        const bytes = Base58.decode(publicKey);
        return bytes.length === 32;
    } catch (e) {
        return false;
    }
};

export const validateAddress = (address: string) => {
    try {
        const bytes = Base58.decode(address);
        return bytes.length ===26 && bytes[0] === 1;
    } catch (e) {
        return false;
    }
};

export const validateNodeUrl = (url: string): Promise<boolean> => {
    try {
        const nodeUrl = new URL(url);

        return axios.get(`${nodeUrl.origin}/node/status`)
            .then(() => true)
            .catch(() => false)
    } catch (error) {
        return Promise.resolve(false)
    }
};