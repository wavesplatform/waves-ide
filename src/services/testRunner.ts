import { waitForTx, nodeInteraction, libs } from '@waves/waves-transactions';
import { Runner, Suite, Test } from 'mocha';
import { mediator, Mediator } from '@services';
import { action, observable } from 'mobx';

const {
    currentHeight, waitForHeight,
    waitForTxWithNConfirmations,
    waitNBlocks, balance, balanceDetails, accountData, accountDataByKey, assetBalance
} = nodeInteraction;

const consoleMethods = [
    'log',
    'error',
    'dir',
    'info',
    'warn',
    'assert',
    'debug',
    'clear',
];

export class TestRunner {
    private iframe: any;
    private runner: Runner | null = null;
    private _env: any;
    private _replApi: any

    @observable stats = {
        passes: 0,
        failures: 0
    };

    @observable isRunning = false;

    constructor(private mediator: Mediator) {
        // Create iframe sandbox
        // this.iframe = document.createElement('iframe');
        // this.iframe.style.display = 'none';
        // this.iframe.setAttribute('name', 'testsRunner');
        // document.body.appendChild(this.iframe);
        //
        // // Setup iframe environment
        // this.iframe.contentWindow.env = null;
        // this.iframe.contentWindow.executeTest = this.executeTest.bind(this);
        // this.iframe.contentWindow.console = this.createConsoleProxy();
        // // this._bindUtilityFunctions();
        //
        // // Add scripts
        // this._addScriptToContext('https://www.chaijs.com/chai.js', 'chaiScript');
    }

    public bindReplAPI(replApi: any) {
        this._replApi = replApi;
    }

    public async runTest(test: string, grep?: string) {

        this.mediator.dispatch('testRepl => clear');

        await this.createSandbox();
        const iframeWindow = this.iframe.contentWindow;

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }
            await iframeWindow.executeTest(test);

            this.runner = iframeWindow.mocha.run();
        } catch (error) {
            console.error(error);
        }
    }

    public async compileTest(test: string) {
        await this.createSandbox();

        return this.iframe.contentWindow.executeTest(test);
    }

    public abort() {
        this.runner && this.runner.abort();
        this.isRunning = false;
    }

    public updateEnv(env: any) {
        this._env = env;
        // this.iframe.contentWindow['env'] = env;
    }

    private async createSandbox(){
        // Create iframe sandbox
        delete this.iframe;
        const domElement = document.getElementById('testRunner');
        domElement && domElement.parentNode!.removeChild(domElement);
        this.iframe = document.createElement('iframe');
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('id', 'testRunner');
        document.body.appendChild(this.iframe);

        // Setup iframe environment

        await this._addScriptToContext('testRunnerEnv.js', 'envScript')
            .then(() => {
                this.iframe.contentWindow.mocha.setup({
                    ui: 'bdd',
                    timeout: 20000,
                    reporter: this._reporter
                });
            });

        const contentWindow = this.iframe.contentWindow;
        contentWindow.env = this._env;
        contentWindow.executeTest = this.executeTest.bind(this);
        contentWindow.console = this.createConsoleProxy();
        try {
            Object.keys(this._replApi)
                .forEach(method => contentWindow[method] = this._replApi[method]);
        } catch (error) {
            console.error(error);
        }
    }

    // private async reloadMocha() {
    //     delete this.iframe.contentWindow.describe;
    //     delete this.iframe.contentWindow.it;
    //     delete this.iframe.contentWindow.mocha;
    //     await this._addScriptToContext('https://unpkg.com/mocha@6.0.0/mocha.js', 'mochaScript')
    //         .then(() => {
    //             this.iframe.contentWindow.mocha.setup({
    //                 ui: 'bdd',
    //                 timeout: 20000,
    //                 reporter: this._reporter
    //             });
    //         });
    // }

    private writeToRepl(method: string, ...args: any[]) {
        this.mediator.dispatch('testRepl => write', method, ...args);
    }

    private async executeTest(test: string) {
        const iframeWindow = this.iframe.contentWindow;
        try {
            iframeWindow.eval(test);

            return iframeWindow.mocha;
        } catch (error) {
            throw error;
        }
    }

    private createConsoleProxy() {
        const consoleProxy: { [key: string]: any } = {};

        try {
            consoleMethods.forEach(method => {
                consoleProxy[method] = (...args: any[]) => {
                    this.writeToRepl(method, ...args);
                };
            });
        } catch (error) {
            console.error(error);
        }

        return consoleProxy;
    }

    // private _bindUtilityFunctions() {
    //     const iframeWindow = this.iframe.contentWindow;
    //
    //     const withDefaults = (options: nodeInteraction.INodeRequestOptions = {}) => ({
    //         timeout: options.timeout || 20000,
    //         apiBase: options.apiBase || iframeWindow.env.API_BASE
    //     });
    //
    //     iframeWindow.waitForTx = async (txId: string, options?: nodeInteraction.INodeRequestOptions) =>
    //         waitForTx(txId, withDefaults(options));
    //
    //     iframeWindow.waitForTxWithNConfirmations = async (txId: string, confirmations: number, options?: nodeInteraction.INodeRequestOptions) =>
    //         waitForTxWithNConfirmations(txId, confirmations, withDefaults(options));
    //
    //     iframeWindow.waitNBlocks = async (blocksCount: number, options?: nodeInteraction.INodeRequestOptions) =>
    //         waitNBlocks(blocksCount, withDefaults(options));
    //
    //     iframeWindow.currentHeight = async (apiBase?: string) => currentHeight(apiBase || iframeWindow.env.API_BASE);
    //
    //     iframeWindow.waitForHeight = async (target: number, options?: nodeInteraction.INodeRequestOptions) =>
    //         waitForHeight(target, withDefaults(options));
    //
    //     iframeWindow.balance = async (address?: string, apiBase?: string) =>
    //         balance(address || libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID), apiBase || iframeWindow.env.API_BASE);
    //
    //     iframeWindow.assetBalance = async (assetId: string, address?: string, apiBase?: string) =>
    //         assetBalance(assetId, address || libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID), apiBase || iframeWindow.env.API_BASE);
    //
    //     iframeWindow.balanceDetails = async (address?: string, apiBase?: string) =>
    //         balanceDetails(address || libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID), apiBase || iframeWindow.env.API_BASE);
    //
    //     iframeWindow.accountData = async (address?: string, apiBase?: string) =>
    //         accountData(address || libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID), apiBase || iframeWindow.env.API_BASE);
    //
    //     iframeWindow.accountDataByKey = async (key: string, address?: string, apiBase?: string) =>
    //         accountDataByKey(key,
    //             address || libs.crypto.address(iframeWindow.env.SEED, iframeWindow.env.CHAIN_ID),
    //             apiBase || iframeWindow.env.API_BASE
    //         );
    // }

    private _addScriptToContext = (src: string, name: string) => {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.defer = true;
            script.id = name;
            this.iframe.contentDocument.body.appendChild(script);

            script.onload = () => resolve();

            script.onerror = () => reject();
        });
    };

    @action
    private _reporter = (runner: Runner) => {
        this.isRunning = true;
        this.stats.passes = 0;
        this.stats.failures = 0;

        runner.on('suite', (test: Suite) => {
            if (test.fullTitle()) {
                this.writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
            }
        });

        runner.on('pass', (test: Test) => {
            this.stats.passes++;

            this.writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
        });

        runner.on('fail', (test: Test, err: any) => {
            this.stats.failures++;

            this.writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
        });

        runner.on('end', () => {
            this.writeToRepl('log', `\ud83d\udd1a End: ${this.stats.passes} of ${this.stats.passes + this.stats.failures} passed.`);
            this.isRunning = false;
            delete this.iframe;
        });
    };
}

export default new TestRunner(mediator);
