import {Repl} from 'waves-repl'

let iframe: any = null;
let iframeDocument: any = null;
let iframeWindow: any = null;

const bindAPItoIFrame = () => {
    const consoleAPI = Repl.API;

    try {
        Object.keys(consoleAPI).forEach(key => iframeWindow[key] = consoleAPI[key]);
    } catch (e) {
        console.error(e)
    }
};

const configureMocha = () => {
    const code = `
        function customReporter(runner) {
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

        mocha.setup({
            ui: 'bdd',
            reporter: customReporter
        });
    `;
    
    iframeWindow.eval(code);
};

const addTest = () => {
    const code = `
        describe('Object test', () => {
            it('Should return false', () => {
                const object = {a: 1};
                chai.expect(object).to.have.own.property('b');
            });

            it('Should return true', () => {
                const object = {a: 1};
                chai.expect(object).to.have.own.property('a');
            });
        })
    `;

    iframeWindow.eval(code);
};

const runTest = () => {
    const code = `
        mocha.run();
    `;

    iframeWindow.eval(code);
};

function addIframe() {
    iframe = document.createElement('iframe');
    iframe.width = iframe.height = 1;
    iframe.style.opacity = 0;
    iframe.style.border = 0;
    iframe.style.position = 'absolute';
    iframe.style.top = '-100px';
    iframe.setAttribute('name', 'iframe');
    document.body.appendChild(iframe);

    iframeDocument = iframe.contentDocument;
    iframeWindow = iframe.contentWindow;
};

function createSandbox() {
    addIframe();

    Promise.all([
        addScript('https://cdn.rawgit.com/mochajs/mocha/2.2.5/mocha.js'),
        addScript('https://cdnjs.cloudflare.com/ajax/libs/chai/4.2.0/chai.min.js')
    ]).then(() => {
        configureMocha();
        bindAPItoIFrame();
    });
};

function addScript(src: string) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = src;
        script.type ='text/javascript';
        script.defer = true;
        iframeDocument.body.appendChild(script);

        script.onload = () => resolve();

        script.onerror = () => reject();
    });
};

export {
    createSandbox,
    addTest,
    runTest
};
