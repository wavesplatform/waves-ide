import {  TSeedTypes } from '@waves/waves-transactions/';
import { TSchemaType } from './schemas/buildHelp';

import envFuncsSchema from './schemas/envFunctions.json';
import * as envFuncs from '@waves/js-test-env';

export class WavesConsoleAPI {
    static env: any;

    [key: string]: any;

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    constructor(){
        envFuncs.addEnvFunctionsToGlobal(this)
        // Object.keys(envFuncs).forEach(name => this[name] = (envFuncs as any)[name]);
        // console.log(envFuncs)
    }

    public deploy = async (params?: { fee?: number, senderPublicKey?: string, script?: string }, seed?: TSeedTypes) => {
        let txParams = {additionalFee: 400000, script: this.compile(this.contract()), ...params};

        const setScriptTx = this['setScript'](txParams, seed);
        return this['broadcast'](setScriptTx);
    };

    public help = (func?: Function) => {
        let pos: number = -1;
        let al0: string = '';
        let type: string = typeof func;
        let aliases: Array<string> = [];

        // Try to find function name
        for (al0 in this) {
            if ((type == 'undefined' || func == this[al0])) {
                aliases.push(al0);
            }
        }

        // Sort functions list and move help help to the top
        if (aliases.length > 1) {
            aliases.sort((a, b) => {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // Get position of help in list
            pos = aliases.indexOf('help');

            // Move help to the top of list
            aliases.unshift(aliases.splice(pos, 1)[0]);
        }
        return (envFuncsSchema as TSchemaType[]).filter(({name}: TSchemaType) => aliases.includes(name));
    };

}
