import { Runner, Suite, Test } from 'mocha';
import { mediator, Mediator } from '@services';
import { action, observable } from 'mobx';
import { injectTestEnvironment } from '@services/testRunnerEnv';
import { IJSFile } from "@stores";

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

interface ICompilationResult {
    result: ISuite
}

interface ITest {
    fullTitle: string
    title: string
}

export interface ISuite extends ITest {
    suites: ISuite[]
    tests: ITest[]
}

type TTestRunnerInfo = {
    fileId: string | null,
    fileName: string | null,
    tree: ISuite | null,
    testsCount: number,
    passes: number,
    failures: number
};


export class TestRunner {
    private frameId = 0;
    private runner: Runner | null = null;
    private _env: any;
    private consoleProxy: any;

    @observable info: TTestRunnerInfo = {
        fileId: null,
        fileName: null,
        tree: null,
        testsCount: 0,
        passes: 0,
        failures: 0
    };

    @observable isRunning = false;

    constructor(private mediator: Mediator) {
        this.consoleProxy = this.createConsoleProxy();
    }

    private calculateTestsCount = (compilationResult: any): number => {
        let testsCount = 0;
        if (compilationResult.tests) testsCount += compilationResult.tests.length;
        if (compilationResult.suites) {
            compilationResult.suites
                .forEach((suite: any) => testsCount += this.calculateTestsCount(suite));
        }
        return testsCount;
    };

    @action
    public async runTest(file: IJSFile, grep?: string) {

        this.mediator.dispatch('testRepl => clear');

        const sandbox = await this.createSandbox();
        const iframeWindow = sandbox.contentWindow;

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }

            const compilationResult: ICompilationResult = await iframeWindow.compileTest(file.content);
            const tree = compilationResult.result;
            this.info = {
                ...this.info,
                tree,
                fileId: file.id,
                fileName: file.name,
                testsCount: this.calculateTestsCount(tree)
            };

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
    private setStatus = (test: Test | Suite, status: 'failed' | 'passed' | 'pending') => {
        const path = this.getTestPath(test);
        path.reduce((accumulator, {type, index}) => (accumulator as any)[type][index], this.info.tree).status = status;
    };


    private getTestPath = (test: Test | Suite) => {
        let path: { type: 'tests' | 'suites', index: number }[] = [];
        let parent = test.parent;
        let current = test;
        while (parent != null) {
            if ('tests' in current) {
                path.push({index: parent.suites.indexOf(current), type: 'suites'});
            } else {
                path.push({index: parent.tests.indexOf(current), type: 'tests'});
            }
            current = parent;
            parent = parent.parent;
        }
        return path.reverse();
    };

    private isPassedSuite = (data: Suite): boolean => {
        const check = (test: Test | Suite): boolean => ('tests' in test)
            ? !test.tests.map(v => check(v)).includes(false)
            : (test as any).status === 'passed';

        const path = this.getTestPath(data);
        const suite = path.reduce((accumulator, {type, index}) => (accumulator as any)[type][index], this.info.tree);
        return check(suite);
    };

    @action
    private _reporter = (runner: Runner, frameId: string) => {
        this.isRunning = true;
        this.info.passes = 0;
        this.info.failures = 0;

        runner.on('suite', (test: Suite) => {
            if (test.fullTitle()) {
                this.writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
            }
            this.setStatus(test, 'pending');
        });

        // runner.on('start', () => {
        //     this.writeToRepl('log', 'Test were startted');
        // })

        runner.on('test', (test: Test) => {
            this.writeToRepl('log', `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`);
            this.setStatus(test, 'pending');
        });

        runner.on('suite end', (test: Suite) => {
            this.writeToRepl('log', `\u2705 End suite: ${test.title}`);
            this.setStatus(test, this.isPassedSuite(test) ? 'passed' : 'failed');

        });

        runner.on('pass', (test: Test) => {
            this.info.passes++;
            this.writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
            this.setStatus(test, 'passed');
        });

        runner.on('fail', (test: Test, err: any) => {
            this.info.failures++;
            this.writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
            this.writeToRepl('error', err);
            this.setStatus(test, 'failed');
        });

        runner.on('end', () => {
            this.writeToRepl(
                'log',
                `\ud83d\udd1a End: ${this.info.passes} of ${this.info.passes + this.info.failures} passed.`
            );
            this.isRunning = false;
            this.runner = null;
            const domElement = document.getElementById(frameId);
            domElement && domElement.parentNode!.removeChild(domElement);
        });
    };
}

export default new TestRunner(mediator);
