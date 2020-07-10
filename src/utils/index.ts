import axios from 'axios';
import { libs } from '@waves/waves-transactions/';

const getNetworkByte = (apiBase: string): Promise<string | undefined> => {
    return axios.get('addresses', {baseURL: apiBase})
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
