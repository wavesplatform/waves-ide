import { waitForTx } from '@waves/waves-transactions';
import { Runner, Suite, Test } from 'mocha';
import mediator, { Mediator } from '@src/services/mediator';
import { action, observable } from 'mobx';

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
    private readonly iframe: any;
    private runner: Runner | null = null;

    @observable stats = {
        passes: 0,
        failures: 0
    };

    @observable isRunning = false;

    constructor(private mediator: Mediator) {
        // Create iframe sandbox
        this.iframe = document.createElement('iframe');
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('name', 'testsRunner');
        document.body.appendChild(this.iframe);

        // Setup iframe environment
        this.iframe.contentWindow.env = null;
        this.iframe.contentWindow.executeTest = this.executeTest.bind(this);
        this.iframe.contentWindow.console = this.createConsoleProxy();
        this._bindUtilityFunctions();

        // Add scripts
        this._addScriptToContext('https://www.chaijs.com/chai.js', 'chaiScript');
    }

    public bindReplAPI(replApi: any) {
        const contentWindow = this.iframe.contentWindow;
        try {
            Object.keys(replApi)
                .forEach(method => contentWindow[method] = replApi[method]);
        } catch (error) {
            console.error(error);
        }
    }

    public async runTest(test: string, grep?: string) {
        const iframeWindow = this.iframe.contentWindow;
        this.mediator.dispatch('testRepl => clear');

        await this.reloadMocha();

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }
            await iframeWindow.executeTest(test);
            this.runner = iframeWindow.mocha.run();
        } catch (error) {
            this.writeToRepl('error', error);
        }
    }

    public async compileTest(test: string) {
        await this.reloadMocha();
        return this.iframe.contentWindow.executeTest(test);
    }

    public abort() {
        this.runner && this.runner.abort();
    }

    public updateEnv(env: any) {
        this.iframe.contentWindow['env'] = env;
    }

    private async reloadMocha() {
        delete this.iframe.contentWindow.describe;
        delete this.iframe.contentWindow.it;
        delete this.iframe.contentWindow.mocha;
        await this._addScriptToContext('https://unpkg.com/mocha@6.0.0/mocha.js', 'mochaScript')
            .then(() => {
                this.iframe.contentWindow.mocha.setup({
                    ui: 'bdd',
                    timeout: 20000,
                    reporter: this._reporter
                });
            });
    }

    private writeToRepl(type: 'log' | 'error', message: string) {
        this.mediator.dispatch('testRepl => write', type, message);
    }

    private async executeTest(test: string) {
        const iframeWindow = this.iframe.contentWindow;
        try {
            iframeWindow.eval(test);

            return iframeWindow.mocha;
        } catch (error) {
            this.writeToRepl('error', error);

            throw error;
        }
    }

    private createConsoleProxy() {
        const customConsole: { [key: string]: any } = {};
        try {
            consoleMethods.forEach(method => {
                customConsole[method] = (...args: any[]) => {
                    this.mediator.dispatch(method, ...args);
                };
            });
        } catch (error) {
            console.error(error);
        }
        return customConsole;
    }

    private _bindUtilityFunctions() {
        const iframeWindow = this.iframe.contentWindow;
        iframeWindow.waitForTx = async (txId: string, timeout: number = 20000, apiBase?: string) =>
            waitForTx(txId, timeout, apiBase || iframeWindow.env.API_BASE);
    }

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
        });
    };
}

export default new TestRunner(mediator);