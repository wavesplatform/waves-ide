import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// import { libs, nodeInteraction, TTxParams, TSeedTypes, TTx } from '@waves/waves-transactions';
import * as wt from '@waves/waves-transactions';
import { compile as cmpl } from '@waves/ride-js';

const {keyPair, address, stringToUint8Array, signBytes} = wt.libs.crypto;

const {
    currentHeight, waitForHeight,
    waitForTxWithNConfirmations,
    waitNBlocks, balance, balanceDetails, accountData, accountDataByKey, assetBalance, waitForTx
} = wt.nodeInteraction;

chai.use(chaiAsPromised);

export const injectTestEnvironment = (iframeWindow: any) => {

    iframeWindow.env = {};

    iframeWindow.expect = chai.expect;

    iframeWindow.compileTest = (test: string) => {
        try {
            iframeWindow.eval(test);
        } catch (e) {
            console.error(e);
        }
        return iframeWindow.mocha;
    };

    const withDefaults = (options: wt.nodeInteraction.INodeRequestOptions = {}) => ({
        timeout: options.timeout || 20000,
        apiBase: options.apiBase || iframeWindow.env.API_BASE
    });

    const injectEnv = <T extends (pp: any, ...args: any) => any>
    (f: T) => (po: wt.TTxParams, seed?: wt.TSeedTypes | null): ReturnType<typeof f> =>
        f({chainId: iframeWindow.env.CHAIN_ID, ...po}, seed === null ? null : seed || iframeWindow.env.SEED);

    const currentAddress = () => wt.libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID);


    iframeWindow.waitForTx = async (txId: string, options?: wt.nodeInteraction.INodeRequestOptions) =>
        waitForTx(txId, withDefaults(options));

    iframeWindow.waitForTxWithNConfirmations = async (txId: string,
                                                      confirmations: number,
                                                      options?: wt.nodeInteraction.INodeRequestOptions) =>
        waitForTxWithNConfirmations(txId, confirmations, withDefaults(options));

    iframeWindow.waitNBlocks = async (blocksCount: number, options?: wt.nodeInteraction.INodeRequestOptions) =>
        waitNBlocks(blocksCount, withDefaults(options));

    iframeWindow.currentHeight = async (apiBase?: string) => currentHeight(apiBase || iframeWindow.env.API_BASE);

    iframeWindow.waitForHeight = async (target: number, options?: wt.nodeInteraction.INodeRequestOptions) =>
        waitForHeight(target, withDefaults(options));

    iframeWindow.balance = async (address?: string, apiBase?: string) =>
        balance(address || currentAddress(),
            apiBase || iframeWindow.env.API_BASE);

    iframeWindow.assetBalance = async (assetId: string, address?: string, apiBase?: string) =>
        assetBalance(assetId, address || currentAddress(), apiBase || iframeWindow.env.API_BASE);

    iframeWindow.balanceDetails = async (address?: string, apiBase?: string) =>
        balanceDetails(address || currentAddress(), apiBase || iframeWindow.env.API_BASE);

    iframeWindow.accountData = async (address?: string, apiBase?: string) =>
        accountData(address || currentAddress(), apiBase || iframeWindow.env.API_BASE);

    iframeWindow.accountDataByKey = async (key: string, address?: string, apiBase?: string) =>
        accountDataByKey(key, address || currentAddress(), apiBase || iframeWindow.env.API_BASE);


    iframeWindow.broadcast = (tx: wt.TTx, apiBase?: string) => wt.broadcast(tx, apiBase || iframeWindow.env.API_BASE);

    iframeWindow.file = (tabName?: string): string => {
        if (typeof iframeWindow.env.file !== 'function') {
            throw new Error('File content API is not available. Please provide it to the console');
        }
        return iframeWindow.env.file(tabName);
    };

    iframeWindow.contract = (): string => iframeWindow.file();

    iframeWindow.keyPair = (seed?: string) => keyPair(seed || iframeWindow.env.SEED);

    iframeWindow.publicKey = (seed?: string): string =>
        iframeWindow.keyPair(seed).public;

    iframeWindow.privateKey = (seed: string): string =>
        iframeWindow.keyPair(seed).private;

    iframeWindow.address = (seed?: string, chainId?: string) => address(
        seed || iframeWindow.env.SEED,
        chainId || iframeWindow.env.CHAIN_ID
    );

    iframeWindow.compile = (code: string): string => {
        const resultOrError = cmpl(code);
        if ('error' in resultOrError) throw new Error(resultOrError.error);

        return resultOrError.result.base64;
    };

    iframeWindow.alias = injectEnv(wt.alias);

    iframeWindow.burn = injectEnv(wt.burn);

    iframeWindow.cancelLease = injectEnv(wt.cancelLease);

    iframeWindow.cancelOrder = injectEnv(wt.cancelOrder);

    iframeWindow.data = injectEnv(wt.data);

    iframeWindow.issue = injectEnv(wt.issue);

    iframeWindow.reissue = injectEnv(wt.reissue);

    iframeWindow.lease = injectEnv(wt.lease);

    iframeWindow.massTransfer = injectEnv(wt.massTransfer);

    iframeWindow.order = injectEnv(wt.order);

    iframeWindow.transfer = injectEnv(wt.transfer);

    iframeWindow.setScript = injectEnv(wt.setScript);

    iframeWindow.setAssetScript = injectEnv(wt.setAssetScript);

    iframeWindow.invokeScript = injectEnv(wt.invokeScript);

    iframeWindow.sponsorship = injectEnv(wt.sponsorship);

    iframeWindow.signTx = injectEnv(wt.signTx);

    iframeWindow.stringToUint8Array = stringToUint8Array;

    iframeWindow.signBytes = (bytes: Uint8Array, seed?: string) => signBytes(bytes, seed || iframeWindow.env.SEED);

};
// export const globalEnv: any = {};
