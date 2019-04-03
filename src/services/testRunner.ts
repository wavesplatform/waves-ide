import { waitForTx } from '@waves/waves-transactions';
import { Runner, Suite, Test } from 'mocha';
import mediator, { Mediator } from '@src/services/mediator';

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

    constructor(private mediator: Mediator) {
        // Create iframe sandbox
        this.iframe = document.createElement('iframe');
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('name', 'testsRunner');
        document.body.appendChild(this.iframe);

        // Setup iframe environment
        this.iframe.contentWindow.env = null;
        this.iframe.contentWindow.executeTest = this.executeTest.bind(this);
        this.iframe.contentWindow.console = this.createConsoleProxy.bind(this);
        this._bindUtilityFunctions();

        // Add scripts
        this._addScriptToContext('https://unpkg.com/mocha@6.0.0/mocha.js', 'mochaScript')
            .then(() => {
                this.iframe.contentWindow.mocha.setup({
                    ui: 'bdd',
                    timeout: 20000,
                    reporter: this._reporter
                });
            });
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

        // removeMocha();
        // await configureMocha();

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }
            await iframeWindow.executeTest(test);
            return iframeWindow.mocha.run();
        } catch (error) {
            this.writeToRepl('error', error);
        }
    }

    public async compileTest(test: string) {
        // removeMocha();
        // await configureMocha();
        return this.iframe.contentWindow.executeTest(test);
    }


    public updateEnv(env: any){
        this.iframe.contentWindow['env'] = env;
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

    private _reporter = (runner: Runner) => {
        let passes = 0;
        let failures = 0;

        runner.on('suite', (test: Suite) => {
            if (test.fullTitle()) {
                this.writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
            }
        });

        runner.on('pass', (test: Test) => {
            passes++;

            this.writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
        });

        runner.on('fail', (test: Test, err: any) => {
            failures++;

            this.writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
        });

        runner.on('end', () => {
            this.writeToRepl('log', `\ud83d\udd1a End: ${passes} of ${passes + failures} passed.`);
        });
    }
}

export default new TestRunner(mediator);
//
// const addToRunnerScope = (key: string, value: any) => {
//     iframeWindow[key] = value;
// };
//
// const addIframe = () => {
//     iframe = document.createElement('iframe');
//     iframe.style.display = 'none';
//     iframe.setAttribute('name', 'testsRunner');
//     document.body.appendChild(iframe);
//
//     iframeDocument = iframe.contentDocument;
//     iframeWindow = iframe.contentWindow;
//     iframeWindow.env = null;
// };
//
// const addScriptToRunner = (src: string, name: string) => {
//     return new Promise((resolve, reject) => {
//         let script = document.createElement('script');
//         script.src = src;
//         script.type = 'text/javascript';
//         script.defer = true;
//         script.id = name;
//         iframeDocument.body.appendChild(script);
//
//         script.onload = () => resolve();
//
//         script.onerror = () => reject();
//     });
// };
//
// const bindComponentsMediatorToRunner = (ComponentsMediator: Mediator | null) => {
//     addToRunnerScope('ComponentsMediator', ComponentsMediator);
// };
//
// const bindExecuteTestFunctionToRunner = () => {
//     iframeWindow.executeTest = async (test: string) => {
//         try {
//             iframeWindow.eval(test);
//
//             return iframeWindow.mocha;
//         } catch (error) {
//             writeToRepl('error', error);
//
//             throw error;
//         }
//     };
// };
//
// const bindReplAPItoRunner = (replApi: any) => {
//     try {
//         Object.keys(replApi)
//             .forEach(method => addToRunnerScope(method, replApi[method]));
//     } catch (error) {
//         console.error(error);
//     }
// };
//
// const bindReplMethodsToRunner = () => {
//     const ComponentsMediator = iframeWindow.ComponentsMediator;
//
//     const customConsole: { [key: string]: any } = {};
//
//     try {
//         consoleMethods.forEach(method => {
//             customConsole[method] = (...args: any[]) => {
//                 ComponentsMediator.dispatch(method, ...args);
//             };
//         });
//
//         addToRunnerScope('console', customConsole);
//     } catch (error) {
//         console.error(error);
//     }
// };
//
// const bindWavesTransactionsLibToRunner = () => {
//     try {
//         addToRunnerScope('waitForTx', async (txId: string, timeout: number = 20000, apiBase?: string) => {
//             await waitForTx(txId, timeout, apiBase || iframeWindow.env.API_BASE);
//         });
//     } catch (error) {
//         console.error(error);
//     }
// };
//
// const writeToRepl = (type: 'log' | 'error', message: string) => {
//     const ComponentsMediator = iframeWindow.ComponentsMediator;
//
//     ComponentsMediator.dispatch('testRepl => write', type, message);
// };
//
// const reporter = (runner: Runner) => {
//     let passes = 0;
//     let failures = 0;
//
//     runner.on('suite', (test: Suite) => {
//         if (test.fullTitle()) {
//             writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
//         }
//     });
//
//     runner.on('pass', (test: Test) => {
//         passes++;
//
//         writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
//     });
//
//     runner.on('fail', (test: Test, err: any) => {
//         failures++;
//
//         writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
//     });
//
//     runner.on('end', () => {
//         writeToRepl('log', `\ud83d\udd1a End: ${passes} of ${passes + failures} passed.`);
//     });
// };
//
// const configureMocha = async () => {
//     return addScriptToRunner('https://unpkg.com/mocha@6.0.0/mocha.js', 'mochaScript')
//         .then(() => {
//             iframeWindow.mocha.setup({
//                 ui: 'bdd',
//                 timeout: 20000,
//                 reporter: reporter
//             });
//         });
// };
//
// const setupTestRunner = async (ComponentsMediator: Mediator | null) => {
//     addIframe();
//
//     bindComponentsMediatorToRunner(ComponentsMediator);
//     bindExecuteTestFunctionToRunner();
//     bindReplMethodsToRunner();
//     bindWavesTransactionsLibToRunner();
//
//     await addScriptToRunner('https://www.chaijs.com/chai.js', 'chaiScript');
//
//     await configureMocha();
// };
//
// const runTest = async (grep?: string) => {
//     const ComponentsMediator = iframeWindow.ComponentsMediator;
//
//     ComponentsMediator.dispatch('testRepl => clear');
//
//     removeMocha();
//
//     await configureMocha();
//
//     try {
//         if (grep) {
//             iframeWindow.mocha.grep(`/${grep}/`);
//         }
//
//         await iframeWindow.executeTest(iframeWindow.test);
//
//         iframeWindow.mocha.run();
//     } catch (error) {
//         writeToRepl('error', error);
//     }
// };
//
// const compileTest = async (test: string) => {
//     removeMocha();
//
//     await configureMocha();
//
//     return iframeWindow.executeTest(test)
//         .then((mocha: any) => {
//             updateTest(test);
//
//             return mocha;
//         })
//         .catch((error: any) => {
//             throw error;
//         });
// };
//
// const updateTest = (test: string) => {
//     iframeWindow.test = test;
// };
//
// const removeMocha = () => {
//     delete iframeWindow.describe;
//     delete iframeWindow.it;
//     delete iframeWindow.mocha;
// };
//
// // const clearMochaCompilation = () => {
// //     const rootSuite = iframeWindow.mocha.suite;
//
// //     rootSuite.tests = [];
// //     rootSuite.suites = [];
// // };
//
// const updateEnv = (env: any) => {
//     addToRunnerScope('env', env);
// };
//
// export {
//     setupTestRunner,
//     updateTest,
//     compileTest,
//     runTest,
//     updateEnv,
//     bindReplAPItoRunner
// };
