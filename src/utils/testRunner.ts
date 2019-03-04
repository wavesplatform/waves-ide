import { Repl } from 'waves-repl';
import { waitForTx } from '@waves/waves-transactions';
import { Runner, Suite, Test } from 'mocha';

// TO DO переделать на класс
let iframe: any = null;
let iframeDocument: any = null;
let iframeWindow: any = null;

const addToGlobalScope = (key: string, value: any) => {
    iframeWindow[key] = value;
};

const addIframe = () => {
    iframe = document.createElement('iframe');
    iframe.width = iframe.height = 1;
    iframe.style.opacity = 0;
    iframe.style.border = 0;
    iframe.style.position = 'absolute';
    iframe.style.top = '-100px';
    iframe.setAttribute('name', 'testsRunner');
    document.body.appendChild(iframe);
    iframeDocument = iframe.contentDocument;
    iframeWindow = iframe.contentWindow;

    iframeWindow.env = null;
};

const addScriptToIframe = (src: string, name: string) => {
    return new Promise(function(resolve, reject) {
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

const bindReplAPItoRunner = (repl: any) => {
    const replApi = repl.API;
    const replMethods = repl.Methods;

    try {
        Object.keys(replApi)
            .forEach(method => addToGlobalScope(method, replApi[method]));
    } catch (e) {
        replMethods.error(e);
    }
};

const bindReplMethodsToRunner = (repl: any) => {
    const console: { [key: string]: any } = {};
    
    const replMethods = repl.Methods;

    try {
        Object.keys(replMethods)
            .forEach(method => console[method] = replMethods[method]);

        addToGlobalScope('console', console);
    } catch (e) {
        replMethods.error(e);
    }
};

const bindWavesTransactionsLibToRunner = () => {
    try {
        addToGlobalScope('waitForTx', async (txId: string, timeout: number = 20000, apiBase?: string) => {
            await waitForTx(txId, timeout, apiBase || iframeWindow.env.API_BASE);
        }); 
    } catch (e) {
        console.error(e);
    }
};

const testReporter = (runner: Runner) => {
    let passes = 0;
    let failures = 0;

    const console = iframeWindow.console;

    runner.on('suite', (test: Suite) => {
        if (test.fullTitle()) {
            console.log(`\ud83c\udfc1 Start: ${test.fullTitle()}`);
        }
    });

    runner.on('pass', (test: Test) => {
        passes++;
        
        console.log(`\u2705 Pass: ${test.titlePath().pop()}`);
    });

    runner.on('fail', (test: Test, err: any) => {
        failures++;
        
        console.log(`\u274C Fail: ${test.titlePath().pop()}.\n\u2757 Error message: ${err.message}.`);
    });

    runner.on('end', () => {
        console.log(`\ud83d\udd1a End: ${passes} of ${passes + failures} passed.`);
    });
};

let configureMocha = async () => {
    return addScriptToIframe('https://unpkg.com/mocha@6.0.0/mocha.js', 'mocha')
        .then(() => {
            iframeWindow.mocha.setup({
                ui: 'bdd',
                timeout: 20000,
                reporter: testReporter
            });
        });
};

let setupTestRunner = async (env: any, repl: any) => {
    addIframe();

    await addScriptToIframe('https://www.chaijs.com/chai.js', 'chai');

    await configureMocha();

    updateEnv(env);

    bindReplAPItoRunner(repl);

    bindReplMethodsToRunner(repl);

    bindWavesTransactionsLibToRunner();
};

const runTest = async (test: string) => {
    const mochaEl = iframeDocument.getElementById('mocha');

    if (mochaEl) {
        iframeDocument.getElementById('mocha').remove();

        delete iframeWindow.describe;
        delete iframeWindow.it;
        delete iframeWindow.mocha;
    }

    await configureMocha();

    try {
        iframeWindow.eval(test);

        iframeWindow.mocha.run();
    } catch (error) {
        iframeWindow.console.error(error);
    }
};

const updateEnv = (env: any) => {
    addToGlobalScope('env', env);
};

export {
    setupTestRunner,
    runTest,
    updateEnv
};
