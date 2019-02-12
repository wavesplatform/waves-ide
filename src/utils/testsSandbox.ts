import { Repl } from 'waves-repl';
import { resolve } from 'url';

let iframe: any = null;
let iframeDocument: any = null;
let iframeWindow: any = null;

let test: any = null;

let addIframe = () => {
    iframe = document.createElement('iframe');
    iframe.width = iframe.height = 1;
    iframe.style.opacity = 0;
    iframe.style.border = 0;
    iframe.style.position = 'absolute';
    iframe.style.top = '-100px';
    iframe.setAttribute('name', 'testsSandbox');
    document.body.appendChild(iframe);

    iframeDocument = iframe.contentDocument;
    iframeWindow = iframe.contentWindow;
};

let addScript = (src: string, name: string) => {
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

const bindReplAPItoIFrame = () => {
    const consoleAPI = Repl.API;

    try {
        Object.keys(consoleAPI).forEach(key => iframeWindow[key] = consoleAPI[key]);
    } catch (e) {
        console.error(e);
    }
};

function testReporter(runner) {
    var passes = 0;
    var failures = 0;

    runner.on('pass', function(test) {
        passes++;
        console.log('pass: %s', test.fullTitle());
    });

    runner.on('fail', function(test, err) {
        failures++;
        console.log('fail: %s, error: %s', test.fullTitle(), err.message);
    });

    runner.on('end', function() {
        console.log('end: %d/%d', passes, passes + failures);
    });
};


const configureMocha = () => {
    iframeWindow.test = null;

    iframeWindow.testReporter = testReporter;

    iframeWindow.eval(`
        mocha.setup({
            ui: 'bdd',
            reporter: testReporter
        });
    `);
};

let configureSandbox = async () => {
    return Promise.all([
        addScript('https://cdn.rawgit.com/mochajs/mocha/2.2.5/mocha.js', 'mocha'),
        addScript('https://cdnjs.cloudflare.com/ajax/libs/chai/4.2.0/chai.min.js', 'chai')
    ]).then(() => {
        configureMocha();
        
        bindReplAPItoIFrame();
    });
};

const addTest = (code: string) => {
    test = code;
};

let createSandbox = () => {
    addIframe();
    
    configureSandbox();
};

const runTest = async () => {
    if (iframeWindow.mocha) {
        
        iframeDocument.getElementById('mocha')!.remove();

        delete iframeWindow.describe;
        delete iframeWindow.it;
        delete iframeWindow.mocha;
    };

    await configureSandbox();

    iframeWindow.eval(test);

    iframeWindow.eval('mocha.run();');
};

export {
    createSandbox,
    addTest,
    runTest
};
