import { getContainer } from './run';
import { broadcast, TSeedTypes, TTx } from '@waves/waves-transactions/';
import axios from 'axios';
import augment from '@waves/js-test-env/augment';
import { Console } from '..';
import bindKeeper from '@utils/bindKeeper';
import envFuncsSchema from '@src/json-data/envFunctions.json';
import { NETWORKS } from '@src/constants';
import { getNetworkByte } from '@utils'

export const updateIFrameEnv = (env: any) => {
    try {
        const iframeWindow = getContainer().contentWindow;
        iframeWindow['env'] = env;
    } catch (e) {
        console.error(e);
    }
};

export const bindAPItoIFrame = (console: Console, frame: any) => {
    try {
        const iframeWindow = frame.contentWindow;
        bindKeeper(iframeWindow);
        iframeWindow.deploy = getDeployFunc(iframeWindow);
        iframeWindow.help = getHelpFunc(iframeWindow);
        augment(iframeWindow, {broadcastWrapper: broadcastWrapper(console) as any});

    } catch (e) {
        console.error(e);
    }
};


const getDeployFunc = (iframeWindow: any) =>
    async (params?: { fee?: number, senderPublicKey?: string, script?: string }, seed?: TSeedTypes) => {
        let txParams = {additionalFee: 400000, script: iframeWindow.compile(iframeWindow.contract()), ...params};

        const setScriptTx = iframeWindow['setScript'](txParams, seed);
        return iframeWindow['broadcast'](setScriptTx);
    };

const getHelpFunc = (iframeWindow: any) => (func?: Function) => {
    let aliases = Object.keys(iframeWindow)
        .filter(key => typeof func === 'undefined' || func === iframeWindow[key]);

    return (envFuncsSchema).filter(({name}) => aliases.includes(name))
        .sort((a, b) => (b.name === 'help' || a.name > b.name) ? 1 : -1);
};

const broadcastWrapper = (console: Console) => (f: typeof broadcast) =>
    async (tx: TTx, apiBaseParam: string) => {
        const apiBase = new URL(apiBaseParam).href;

        const pushExplorerLinkToConsole = (href: string) => {
            const htmlString = `<a rel="noopener, noreferrer" href="${href}" target="_blank">Link to transaction in wavesexplorer</a>`;

            console.push({
                html: true,
                value: htmlString,
                type: 'log',
            });
        };

        const generateExplorerLinkToTx = (networkByte: string, txId: number) => {
            switch (networkByte) {
                case 'T':
                    return `https://wavesexplorer.com/testnet/tx/${txId}`;
                case 'S':
                    return `https://wavesexplorer.com/stagenet/tx/${txId}`;
                case 'W':
                    return `https://wavesexplorer.com/tx/${txId}`;
                default:
                    return '';
            }
        };

        const res = await f(tx, apiBase);


        try {
            const systemNode = Object.values(NETWORKS).find(n => n.url === apiBase);
            let networkByte = systemNode !== undefined
                ? systemNode.chainId
                : await getNetworkByte(apiBase);

            if (!networkByte) return

            const isWavesNetwork = Object.values(NETWORKS).map(x => x.chainId).includes(networkByte);

            if (isWavesNetwork) {
                const href = generateExplorerLinkToTx(networkByte, (res as any).id);

                pushExplorerLinkToConsole(href);
            }
        } catch (e) {
            window.console.log('Error occured during network byte check', e);
        }


        return res;

    };
