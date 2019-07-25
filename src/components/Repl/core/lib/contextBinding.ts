import { getContainer } from './run';
import { WavesConsoleAPI } from '../../WavesConsoleAPI';
import { libs, TTx } from '@waves/waves-transactions/';
import axios from 'axios';

import { Console } from '..';

export const updateIFrameEnv = (env: any) => {
    try {
        WavesConsoleAPI.setEnv(env);
        const iframeWindow = getContainer().contentWindow;
        iframeWindow['env'] = env;
    } catch (e) {
        console.error(e);
    }
};

export const bindAPItoIFrame = (consoleApi: WavesConsoleAPI, console: Console) => {
    const apiMethodWrappers: IApiMethodWrappers = getApiMethodWrappers(consoleApi, console);

    try {
        const iframeWindow = getContainer().contentWindow;

        Object.keys(consoleApi)
            .forEach(key => {
                key in apiMethodWrappers
                    ? iframeWindow[key] = apiMethodWrappers[key]
                    : iframeWindow[key] = consoleApi[key];
            });
    } catch (e) {
        console.error(e);
    }
};

interface IApiMethodWrappers {
    [key: string]: any
}

const getNetworkByte = (apiBase: string) => {
    return axios.get(`${apiBase}/addresses`)
        .then(res => {
            const address = res.data[0];

            const byte = libs.marshall.serializePrimitives.BASE58_STRING(address)[1];

            return String.fromCharCode(byte);
        });
};

const getApiMethodWrappers = (consoleApi: WavesConsoleAPI, console: Console): IApiMethodWrappers => {
    return {
        broadcast: async (tx: TTx, apiBaseParam?: string) => {
            const apiBase = new URL(apiBaseParam || WavesConsoleAPI.env.API_BASE).href;

            const nodes = ['https://nodes.wavesplatform.com/', 'https://testnodes.wavesnodes.com/'];

            const pushExplorerLinkToConsole = (href: string) => {
                const htmlString = `<a href="${href}" target="_blank">Link to transaction in wavesexplorer</a>`;

                console.push({
                    html: true,
                    value: htmlString,
                    type: 'log',
                });
            };

            const generateExplorerLinkToTx = (networkByte: string, txId: number) => {
                return (networkByte === 'W')
                    ? `https://wavesexplorer.com/tx/${txId}`
                    : `https://wavesexplorer.com/testnet/tx/${txId}`;
            };


            const res = await consoleApi.broadcast(tx, apiBase);

            if (nodes.includes(apiBase)) {
                const networkByte = apiBase === 'https://nodes.wavesplatform.com/'
                    ? 'W'
                    : 'T';

                const href = generateExplorerLinkToTx(networkByte, res.id);

                pushExplorerLinkToConsole(href);
            } else {
                try {
                    let networkByte = await getNetworkByte(apiBase);

                    const isWavesNetwork = networkByte === 'W' || networkByte === 'T';

                    if (isWavesNetwork) {
                        const href = generateExplorerLinkToTx(networkByte, res.id);

                        pushExplorerLinkToConsole(href);
                    }
                } catch (e) {
                    console.log('Error occured during network byte check');
                }
            }

            return res;

        }
    };
};
