import { libs } from '@waves/waves-transactions/';
import { nodeGet } from './nodeRequest';

const getNetworkByte = (apiBase: string): Promise<string | undefined> => {
    return nodeGet<string[]>(apiBase, '/addresses')
        .then(res => {
            const address = res.data[0];

            const byte = libs.marshall.serializePrimitives.BASE58_STRING(address)[1];

            return String.fromCharCode(byte);
        })
        .catch(() => {
            return undefined
        })
};

export {
    getNetworkByte
}
