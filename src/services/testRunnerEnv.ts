import 'mocha/mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { libs, nodeInteraction } from '@waves/waves-transactions';

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
