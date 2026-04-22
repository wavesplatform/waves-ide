import Base58 from './base58';
import { nodeGet } from './nodeRequest';

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

        return nodeGet(nodeUrl.toString(), '/node/status')
            .then(() => true)
            .catch((e: any) => {
                if (e?.code === 'CORS_BLOCKED' || e?.message === 'CORS_BLOCKED') {
                    // Browser cannot validate cross-origin node without CORS headers.
                    return true;
                }
                return false;
            })
    } catch (error) {
        return Promise.resolve(false)
    }
};
