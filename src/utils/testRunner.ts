import { Repl } from '@waves/repl';
import { waitForTx } from '@waves/waves-transactions';
import { Runner, Suite, Test } from 'mocha';

import Mediator from '@utils/Mediator';

// TO DO переделать на класс
// Также стоит перенести в в сервисы вместе с языковым сервисом монако
let iframe: any = null;
let iframeDocument: any = null;
let iframeWindow: any = null;

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

const addToRunnerScope = (key: string, value: any) => {
    iframeWindow[key] = value;
};

const addIframe = () => {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('name', 'testsRunner');
    document.body.appendChild(iframe);

    iframeDocument = iframe.contentDocument;
    iframeWindow = iframe.contentWindow;
    iframeWindow.env = null;
};

const addScriptToRunner = (src: string, name: string) => {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.defer = true;
        script.id = name;
        iframeDocument.body.appendChild(script);

        script.onload = () => resolve();

        script.onerror = () => reject();
    });
};

const bindTestReplMediatorToRunner = (TestReplMediator : Mediator | null) => {
    addToRunnerScope('TestReplMediator', TestReplMediator);
};

const bindExecuteTestFunctionToRunner = () => {
    iframeWindow.executeTest = async (test: string) => {
        try {
            iframeWindow.eval(test);

            return iframeWindow.mocha;
        } catch (error) {
            writeToRepl('error', error);

            throw error;
        }
    };
};

const bindReplAPItoRunner = (repl: Repl) => {
    const replApi = repl.API;
    
    try {
        Object.keys(replApi)
            .forEach(method => addToRunnerScope(method, replApi[method]));
    } catch (error) {
        console.error(error);
    }
};

const bindReplMethodsToRunner = () => {
    const TestReplMediator = iframeWindow.TestReplMediator;

    const customConsole: { [key: string]: any } = {};

    try {
        consoleMethods.forEach(method => {
            customConsole[method] = (...args: any[]) => {
                TestReplMediator.dispatch(method, ...args);
            };
        });

        addToRunnerScope('console', customConsole);
    } catch (error) {
        console.error(error);
    }
};

const bindWavesTransactionsLibToRunner = () => {
    try {
        addToRunnerScope('waitForTx', async (txId: string, timeout: number = 20000, apiBase?: string) => {
            await waitForTx(txId, timeout, apiBase || iframeWindow.env.API_BASE);
        }); 
    } catch (error) {
        console.error(error);
    }
};

const writeToRepl = (type: 'log' | 'error', message: string) => {
    iframeWindow.TestReplMediator.dispatch(type, message);
};

const reporter = (runner: Runner) => {
    let passes = 0;
    let failures = 0;

    runner.on('suite', (test: Suite) => {
        if (test.fullTitle()) {
            writeToRepl('log', `\ud83c\udfc1 Start suite: ${test.title}`);
        }
    });

    runner.on('pass', (test: Test) => {
        passes++;

        writeToRepl('log', `\u2705 Pass test: ${test.titlePath().pop()}`);
    });

    runner.on('fail', (test: Test, err: any) => {
        failures++;

        writeToRepl('log', `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);
    });

    runner.on('end', () => {
        writeToRepl('log', `\ud83d\udd1a End: ${passes} of ${passes + failures} passed.`);
    });
};

const configureMocha = async () => {
  return addScriptToRunner('https://unpkg.com/mocha@6.0.0/mocha.js', 'mochaScript')
    .then(() => {
        iframeWindow.mocha.setup({
            ui: 'bdd',
            timeout: 20000,
            reporter: reporter
        });
    });
};

const setupTestRunner = async (TestReplMediator: Mediator | null) => {
    addIframe();
    
    bindTestReplMediatorToRunner(TestReplMediator);
    bindExecuteTestFunctionToRunner();
    bindReplMethodsToRunner();
    bindWavesTransactionsLibToRunner();

    await addScriptToRunner('https://www.chaijs.com/chai.js', 'chaiScript');

    await configureMocha();
};

const runTest = async (grep?: string) => {
    removeMocha();
 
    await configureMocha();

    try {
        if (grep) {
            iframeWindow.mocha.grep(`/${grep}/`);
        }

        await iframeWindow.executeTest(iframeWindow.test);

        iframeWindow.mocha.run();
    } catch (error) {
        writeToRepl('error', error);
    }
};

const compileTest = async (test: string) => {
    removeMocha();

    await configureMocha();

    return iframeWindow.executeTest(test)
        .then((mocha: any) => {
            return mocha.suite;
        })
        .catch((error: any) => {
            throw error;
        });
};

const updateTest = (test: string) => {
    iframeWindow.test = test;
};

const removeMocha = () => {
    delete iframeWindow.describe;
    delete iframeWindow.it;
    delete iframeWindow.mocha;
};

// const clearMochaCompilation = () => {
//     const rootSuite = iframeWindow.mocha.suite;

//     rootSuite.tests = [];
//     rootSuite.suites = [];
// };

const updateEnv = (env: any) => {
    addToRunnerScope('env', env);
};

export {
    setupTestRunner,
    updateTest,
    compileTest,
    runTest,
    updateEnv,
    bindReplAPItoRunner
};
