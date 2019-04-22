import 'mocha/mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { libs, nodeInteraction, TTxParams, TSeedTypes, TTx } from '@waves/waves-transactions';
import * as wt from '@waves/waves-transactions';
import { compile as cmpl } from '@waves/ride-js';

const {keyPair, address} = libs.crypto;

const {
    currentHeight, waitForHeight,
    waitForTxWithNConfirmations,
    waitNBlocks, balance, balanceDetails, accountData, accountDataByKey, assetBalance, waitForTx
} = nodeInteraction;

chai.use(chaiAsPromised);

const globalEnv: any = global;

globalEnv.env = {};

globalEnv.expect = chai.expect;

const withDefaults = (options: nodeInteraction.INodeRequestOptions = {}) => ({
    timeout: options.timeout || 20000,
    apiBase: options.apiBase || globalEnv.env.API_BASE
});

const injectEnv = <T extends (pp: any, ...args: any) => any>(f: T) => (po: TTxParams, seed?: TSeedTypes | null): ReturnType<typeof f> =>
    f({chainId: globalEnv.env.CHAIN_ID, ...po}, seed === null ? null : seed || globalEnv.env.SEED);

const currentAddress = () => libs.crypto.address(globalEnv.env.SEED, globalEnv.env.CHAIN_ID);


globalEnv.waitForTx = async (txId: string, options?: nodeInteraction.INodeRequestOptions) =>
    waitForTx(txId, withDefaults(options));

globalEnv.waitForTxWithNConfirmations = async (txId: string,
                                               confirmations: number,
                                               options?: nodeInteraction.INodeRequestOptions) =>
    waitForTxWithNConfirmations(txId, confirmations, withDefaults(options));

globalEnv.waitNBlocks = async (blocksCount: number, options?: nodeInteraction.INodeRequestOptions) =>
    waitNBlocks(blocksCount, withDefaults(options));

globalEnv.currentHeight = async (apiBase?: string) => currentHeight(apiBase || globalEnv.env.API_BASE);

globalEnv.waitForHeight = async (target: number, options?: nodeInteraction.INodeRequestOptions) =>
    waitForHeight(target, withDefaults(options));

globalEnv.balance = async (address?: string, apiBase?: string) =>
    balance(address || currentAddress(),
        apiBase || globalEnv.env.API_BASE);

globalEnv.assetBalance = async (assetId: string, address?: string, apiBase?: string) =>
    assetBalance(assetId, address || currentAddress(), apiBase || globalEnv.env.API_BASE);

globalEnv.balanceDetails = async (address?: string, apiBase?: string) =>
    balanceDetails(address || currentAddress(), apiBase || globalEnv.env.API_BASE);

globalEnv.accountData = async (address?: string, apiBase?: string) =>
    accountData(address || currentAddress(), apiBase || globalEnv.env.API_BASE);

globalEnv.accountDataByKey = async (key: string, address?: string, apiBase?: string) =>
    accountDataByKey(key, address || currentAddress(), apiBase || globalEnv.env.API_BASE);


globalEnv.broadcast = (tx: TTx, apiBase?: string) => wt.broadcast(tx, apiBase || globalEnv.env.API_BASE);

globalEnv.file = (tabName?: string): string => {
    if (typeof globalEnv.env.file !== 'function') {
        throw new Error('File content API is not available. Please provide it to the console');
    }
    return globalEnv.env.file(tabName);
};

globalEnv.contract = (): string => globalEnv.file();

globalEnv.keyPair = (seed?: string) => keyPair(seed || globalEnv.env.SEED);

globalEnv.publicKey = (seed?: string): string =>
    globalEnv.keyPair(seed).public;

globalEnv.privateKey = (seed: string): string =>
    globalEnv.keyPair(seed).private;

globalEnv.address = (seed?: string, chainId?: string) => address(
    seed || globalEnv.env.SEED,
    chainId || globalEnv.env.CHAIN_ID
);

globalEnv.compile = (code: string): string => {
    const resultOrError = cmpl(code);
    if ('error' in resultOrError) throw new Error(resultOrError.error);

    return resultOrError.result.base64;
};

globalEnv.alias = injectEnv(wt.alias);

globalEnv.burn = injectEnv(wt.burn);

globalEnv.cancelLease = injectEnv(wt.cancelLease);

globalEnv.cancelOrder = injectEnv(wt.cancelOrder);

globalEnv.data = injectEnv(wt.data);

globalEnv.issue = injectEnv(wt.issue);

globalEnv.reissue = injectEnv(wt.reissue);

globalEnv.lease = injectEnv(wt.lease);

globalEnv.massTransfer = injectEnv(wt.massTransfer);

globalEnv.order = injectEnv(wt.order);

globalEnv.transfer = injectEnv(wt.transfer);

globalEnv.setScript = injectEnv(wt.setScript);

globalEnv.setAssetScript = injectEnv(wt.setAssetScript);

globalEnv.invokeScript = injectEnv(wt.invokeScript);

globalEnv.sponsorship = injectEnv(wt.sponsorship);

globalEnv.signTx = injectEnv(wt.signTx);
