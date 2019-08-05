import { getContainer } from './run';
import { broadcast, libs, TSeedTypes, TTx } from '@waves/waves-transactions/';
import axios from 'axios';
import { addEnvFunctionsToGlobal } from '@waves/js-test-env';
import { Console } from '..';
import bindKeeper from '@utils/bindKeeper';
import { TSchemaType } from '../../../../../scripts/build-schemas';
import envFuncsSchema from '@src/json-data/envFunctions.json';

export const updateIFrameEnv = (env: any) => {
    try {
        const iframeWindow = getContainer().contentWindow;
        iframeWindow['env'] = env;
    } catch (e) {
        console.error(e);
    }
};

export const bindAPItoIFrame = (console: Console) => {
    try {
        const iframeWindow = getContainer().contentWindow;
        addEnvFunctionsToGlobal(iframeWindow, {broadcastWrapper: broadcastWrapper(console)});
        bindKeeper(iframeWindow);
        Object.defineProperty(iframeWindow, 'deploy', {
            get: getDeployFunc(iframeWindow),
        });
        Object.defineProperty(iframeWindow, 'help', {
            get: getHelpFunc(iframeWindow)
        });

    } catch (e) {
        console.error(e);
    }
};


const getDeployFunc = (iframeWindow: any) => () =>
    async (params?: { fee?: number, senderPublicKey?: string, script?: string }, seed?: TSeedTypes) => {
        let txParams = {additionalFee: 400000, script: iframeWindow.compile(iframeWindow.contract()), ...params};

        const setScriptTx = iframeWindow['setScript'](txParams, seed);
        return iframeWindow['broadcast'](setScriptTx);
    };

const getHelpFunc = (iframeWindow: any) => () => (func?: Function) => {
    let aliases: Array<string> = [];
    // Try to find function name
    for (let al in iframeWindow) (typeof func === 'undefined' || func === iframeWindow[al]) && aliases.push(al);

    // Sort functions list and move help help to the top
    if (aliases.length > 1) {
        aliases.sort();
        aliases.unshift(aliases.splice(aliases.indexOf('help'), 1)[0]); // Move help to the top of list
    }

    return (envFuncsSchema as TSchemaType[]).filter(({name}: TSchemaType) => aliases.includes(name));
};

const broadcastWrapper = (console: Console) => (f: typeof broadcast) =>
    async (tx: TTx, apiBaseParam: string) => {
        const apiBase = new URL(apiBaseParam).href;

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

        const res = await f(tx, apiBase);

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

    };

const getNetworkByte = (apiBase: string) => {
    return axios.get(`${apiBase}/addresses`)
        .then(res => {
            const address = res.data[0];

            const byte = libs.marshall.serializePrimitives.BASE58_STRING(address)[1];

            return String.fromCharCode(byte);
        });
};
