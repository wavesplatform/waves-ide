import { Runner, Suite, Test } from 'mocha';
import { mediator, Mediator } from '@services';
import { action, observable } from 'mobx';
import { injectTestEnvironment } from '@services/testRunnerEnv';

export type TTest = { title: string, fullTitle: () => string };
export type TSuite = { title: string, fullTitle: () => string, suites: TSuite[], tests: TTest[] };

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

const isFirefox = navigator.userAgent.search('Firefox') > -1;

export class TestRunner {
    private frameId = 0;

    private runner: Runner | null = null;
    private _env: any;
    private consoleProxy: any;

    @observable stats = {
        passes: 0,
        failures: 0
    };

    @observable isRunning = false;

    constructor(private mediator: Mediator) {
        this.consoleProxy = this.createConsoleProxy();
    }

    public async runTest(test: string, grep?: string) {

        this.mediator.dispatch('testRepl => clear');

        const sandbox = await this.createSandbox();
        const iframeWindow = sandbox.contentWindow;

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }
            await iframeWindow.compileTest(test);
            if (!this._env.SEED) { //todo make without hack
                this.writeToRepl('error', 'Account is not created');
                this.stopTest();
                return;
            }
            this.runner = iframeWindow.mocha.run();
        } catch (error) {
            console.error(error);
        }

    }

    public async stopTest() {
        this.isRunning = false;
        try {
            this.runner!.abort();
        } catch (error) {
            console.error(error);
        }
    }

    public async compileTest(test: string) {
        const sandbox = await this.createSandbox();

        const result = sandbox.contentWindow.compileTest(test);

        delete sandbox.env;
        delete sandbox.executeTest;
        delete sandbox.console;
        delete sandbox.mocha;
        delete sandbox.it;
        delete sandbox.describe;
        sandbox.contentWindow.location.reload();
        setTimeout(function () {
            sandbox && sandbox.parentNode!.removeChild(sandbox);
        }, 200);
        return result;
    }

    public abort() {
        this.runner && this.runner.abort();
        this.runner = null;
        this.isRunning = false;
    }

    public updateEnv(env: any) {
        this._env = {...this._env, ...env};
    }

    private async createSandbox(): Promise<any> {
        // Create iframe sandbox
        const iframe = document.createElement('iframe');

        const frameId = 'testRunner-' + this.frameId++;

        iframe.style.display = 'none';
        iframe.setAttribute('id', frameId);
        document.body.appendChild(iframe);
        // Firefox wait for iframe to load
        if (isFirefox) {
            await new Promise(resolve => {
                iframe.onload = resolve;
            });
        }

        // Setup iframe environment
        const contentWindow: any = iframe.contentWindow;
        await this._addScriptToContext('mocha.js', 'mochaScript', iframe)
            .then(() => {
                contentWindow.mocha.setup({
                    ui: 'bdd',
                    timeout: this._env.mochaTimeout,
                    reporter: (runner: Runner) => this._reporter(runner, frameId)
                });
            });

        // Bind functions
        injectTestEnvironment(contentWindow);

        // Bind end variables
        contentWindow.env = this._env;

        // Bind console
        contentWindow.console = this.consoleProxy;


        return iframe;
    }

    private writeToRepl(method: string, ...args: any[]) {
        this.mediator.dispatch('testRepl => write', method, ...args);
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

    private _addScriptToContext = (src: string, name: string, iframe: any) => {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.onload = () => resolve();
            script.onerror = () => reject();
            script.src = src;
            script.type = 'text/javascript';
            script.defer = true;
            script.id = name;
            iframe.contentWindow.document.body.appendChild(script);
        });
    };

    @action
    private _reporter = (runner: Runner, frameId: string) => {
        this.isRunning = true;
        this.stats.passes = 0;
        this.stats.failures = 0;

        runner.on('suite', (test: Suite) => {
            if (test.fullTitle()) {
                this.writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
            }
        });

        // runner.on('start', () => {
        //     this.writeToRepl('log', 'Test were startted');
        // })

        runner.on('test', (test: Test) => {
            this.writeToRepl('log', `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`);
        });

        runner.on('suite end', (test: Suite) => {
            this.writeToRepl('log', `\u2705 End suite: ${test.title}`);
        });

        runner.on('pass', (test: Test) => {
            this.stats.passes++;

            this.writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
        });

        runner.on('fail', (test: Test, err: any) => {
            this.stats.failures++;

            this.writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
            this.writeToRepl('error', err);
        });

        runner.on('end', () => {
            this.writeToRepl(
                'log',
                `\ud83d\udd1a End: ${this.stats.passes} of ${this.stats.passes + this.stats.failures} passed.`
            );
            this.isRunning = false;
            this.runner = null;
            const domElement = document.getElementById(frameId);
            domElement && domElement.parentNode!.removeChild(domElement);
        });
    };
}

export default new TestRunner(mediator);
