import { Runner, Suite, Test } from 'mocha';
import { injectTestEnvironment } from '@services/testRunnerEnv';
import { ICompilationError, ICompilationResult, ITestMessage } from '@utils/jsFileInfo';
import { observable } from 'mobx';

const isFirefox = navigator.userAgent.search('Firefox') > -1;

interface ITestNode {
    parent: ITestNode | null
    title: string
    messages: { type: 'log' | 'error', message: string }[]
    status: 'pending' | 'passed' | 'failed'
    type: 'suite' | 'test'
    children: ITestNode[]
}
//
// interface ISuiteNode extends ITestNode{
//     suites: ISuiteNode[]
//     tests: ISuiteNode[]
// }
// const createNode = ({type, title}: Pick<ITestNode, 'type' | 'title'>): ITestNode => observable({
//     children: [],
//     type,
//     parent: null,
//     status: 'pending',
//     title,
//     messages: []
// });


class TestRunnerService {
    // currentTestNode: ITestNode = createNode({type: 'suite', title: ''});

    async runTest(code: string, env: any, grep?: string): Promise<ITestNode> {
        const sandbox = await this.createSandbox(env);
        const iframeWindow: any = sandbox.element.contentWindow;

        iframeWindow.mocha.setup({
            ui: 'bdd',
            timeout: env.mochaTimeout
        });
        grep && iframeWindow.mocha.grep(`/${grep}/`);

        const compilationResult: ICompilationResult | ICompilationError = await iframeWindow.compileTest(code);
        if ('error' in compilationResult) {
            return observable(observable({
                parent: null,
                status: 'failed',
                title: '',
                type: 'suite',
                children: [],
                messages: [{type: 'error', message: compilationResult.error}]
            })) as ITestNode;
        }

        const tree = convertTree(compilationResult.result);
        const runner = (iframeWindow.mocha as Mocha).run();
        runner.on('end', () => sandbox.dispose());

        return compilationResult.result
    }


    private async createSandbox(env: any): Promise<{ element: HTMLIFrameElement, dispose: () => void }> {
        // Create iframe sandbox
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        // Firefox wait for iframe to load
        if (isFirefox) {
            await new Promise(resolve => {
                iframe.onload = resolve;
            });
        }

        // Setup iframe environment
        const contentWindow: any = iframe.contentWindow;
        await _addScriptToContext('mocha.js', 'mochaScript', iframe);


        // Bind functions
        injectTestEnvironment(contentWindow);

        // Bind end variables
        contentWindow.env = env;

        // Bind console
        contentWindow.console = {
            log: (...message: any) => this.pushMessage({type: 'log', message}),
            error: (...message: any) => this.pushMessage({type: 'error', message}),
            dir: (...message: any) => this.pushMessage({type: 'log', message}),
            info: (...message: any) => this.pushMessage({type: 'log', message}),
            warn: (...message: any) => this.pushMessage({type: 'log', message}),
            assert: (...message: any) => this.pushMessage({type: 'log', message}),
            debug: () => undefined, //fixme
            clear: () => undefined, //fixme
        };


        return {
            element: iframe,
            dispose: () => {
                iframe.parentElement!.removeChild(iframe);
            }
        };
    }


    private _reporter = (runner: Runner) => {


        runner.on('suite', (suite: Suite) => {

            if (suite.fullTitle && !suite.root) {
                this.pushMessage({type: 'log', message: `\ud83c\udfc1 Start suite: ${suite.title}`});
            }
            this.setStatus('pending');
        });

        runner.on('test', (test: Test) => {
            this.setCurrentResultTreeNode(test);
            const message: ITestMessage = {
                type: 'log',
                message: `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`
            };
            this.pushMessage(message);
            this.setStatus('pending');
        });

        runner.on('suite end', (suite: Suite) => {
            this.setCurrentResultTreeNode(suite);
            if (!suite.root) {
                const message: ITestMessage = {type: 'log', message: `\u2705 End suite: ${suite.title}`};
                this.pushMessage(message);
            }
            this.setCurrentResultTreeNode(suite);
            this.setStatus(this.isPassedSuite(suite) ? 'passed' : 'failed');
        });

        runner.on('pass', (test: Test) => {
            this.info.passes++;
            const message: ITestMessage = {type: 'log', message: `\u2705 Pass test: ${test.titlePath().pop()}`};
            this.pushMessage(message);
            this.setStatus('passed');
        });

        runner.on('fail', (test: Test | Hook | Suite, err: any) => {
            if ('type' in test && test.type === 'hook') {
                if (test.parent) this.setStatus('failed');
                const message: ITestMessage =
                    {type: 'log', message: `\u274C Fail: ${test.title}`};
                this.pushMessage(message);
                this.pushMessage({type: 'error', message: err});
                return;
            }
            this.info.failures++;
            const message: ITestMessage =
                {
                    type: 'log',
                    message: `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`
                };
            this.pushMessage(message);
            this.pushMessage({type: 'error', message: err});
            this.setStatus('failed');
        });

        runner.on('end', () => {
            this.getNodeByPath([]).messages.push({
                type: 'log',
                message: `\ud83d\udd1a End: ${this.info.passes} of ${this.info.passes + this.info.failures} passed.`
            });
        });

    };
}

function convertTree(suite: Suite): ITestNode{

}
function _addScriptToContext(src: string, name: string, iframe: HTMLIFrameElement) {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        script.onload = () => resolve();
        script.onerror = () => reject();
        script.src = src;
        script.type = 'text/javascript';
        script.defer = true;
        script.id = name;
        iframe.contentWindow!.document.body.appendChild(script);
    });
}
