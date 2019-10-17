import { Suite, Test } from 'mocha';
import { injectTestEnvironment } from '@services/testRunnerEnv';
import { ICompilationError, ICompilationResult, ISuite } from '@utils/jsFileInfo';
import { observable } from 'mobx';
import Hook = Mocha.Hook;

const isFirefox = navigator.userAgent.search('Firefox') > -1;

export interface ITestMessage {
    message: any
    type: 'log' | 'error' | 'response'
}

export interface ITestNode {
    parent?: ITestNode | null
    title: string
    messages: ITestMessage[]
    status: 'pending' | 'passed' | 'failed'
    type: 'suite' | 'test'
    children: ITestNode[]
}

class TestRunnerService {
    currentTestNode: ITestNode = createNode({type: 'suite', title: ''});

    async runTest(code: string, env: any, grep?: string): Promise<ITestNode> {
        const sandbox = await this.createSandbox(env);
        const iframeWindow: any = sandbox.element.contentWindow;

        iframeWindow.mocha.setup({
            ui: 'bdd',
            timeout: env.mochaTimeout,
            reporter: (() => {
            }) as any // noop reporter
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
        this.currentTestNode = tree;
        const runner = (iframeWindow.mocha as Mocha).run();

        runner.on('suite', (suite: Suite) => {
            const node = findNodeByFullTitle(suite.fullTitle(), tree);
            if (node && !suite.root) {
                this.currentTestNode = node;
                this.currentTestNode.messages.push({type: 'log', message: `\ud83c\udfc1 Start suite: ${suite.title}`});
            }
        });

        runner.on('test', (test: Test) => {
            const node = findNodeByFullTitle(test.fullTitle(), tree);
            if (node) {
                this.currentTestNode = node;
                const message: ITestMessage = {
                    type: 'log',
                    message: `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`
                };
                node.messages.push(message);
            }
        });

        runner.on('suite end', (suite: Suite) => {
            const node = findNodeByFullTitle(suite.fullTitle(), tree);
            if (node && !suite.root) {
                this.currentTestNode = node;
                this.currentTestNode.messages.push({type: 'log', message: `\u2705 End suite: ${suite.title}`});
                this.currentTestNode.status = this.currentTestNode.children.every(ch => ch.status === 'passed') ? 'passed' : 'failed';
            }
        });

        runner.on('pass', (test: Test) => {
            this.currentTestNode.messages.push({type: 'log', message: `\u2705 Pass test: ${test.titlePath().pop()}`});
            this.currentTestNode.status = 'passed';
        });

        runner.on('fail', (test: Test | Hook | Suite, err: any) => {
            const message: ITestMessage = 'type' in test && test.type === 'hook'
                ? {type: 'log', message: `\u274C Fail: ${test.title}`}
                : {type: 'log', message: `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`};
            this.currentTestNode.messages.push(message);
            this.currentTestNode.messages.push({type: 'error', message: err});
            this.currentTestNode.status = 'failed';
        });

        runner.on('end', () => {
            // tree.messages.push({
            //     type: 'log',
            //     message: `\ud83d\udd1a End: ${this.info.passes} of ${this.info.passes + this.info.failures} passed.`
            // });
            sandbox.dispose();
        });

        return tree;
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
            log: (...message: any) => this.currentTestNode.messages.push({type: 'log', message}),
            error: (...message: any) => this.currentTestNode.messages.push({type: 'error', message}),
            dir: (...message: any) => this.currentTestNode.messages.push({type: 'log', message}),
            info: (...message: any) => this.currentTestNode.messages.push({type: 'log', message}),
            warn: (...message: any) => this.currentTestNode.messages.push({type: 'log', message}),
            assert: (...message: any) => this.currentTestNode.messages.push({type: 'log', message}),
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
}

function findNodeByFullTitle(fullTitle: string, tree: ITestNode): ITestNode | null {
    if (fullTitle === '') return tree;
    const nextNode = tree.children.find(child => fullTitle.startsWith(child.title));
    if (!nextNode) return null;
    return findNodeByFullTitle(fullTitle.slice(nextNode.title.length), nextNode);

}

const createNode = ({type, title, parent}: Pick<ITestNode, 'type' | 'title' | 'parent'>): ITestNode => observable({
    children: [],
    type,
    parent,
    status: 'pending',
    title,
    messages: []
});

function convertTree(suite: ISuite): ITestNode {
    const suiteNode = createNode({type: 'suite', title: suite.title});
    const testChildren = suite.tests.map(t => createNode({type: 'test', title: t.title, parent: suiteNode}));
    const suiteChildren = suite.suites.map(s => convertTree(s)).map(s => ({...s, parent: suiteNode}));
    suiteNode.children = [...suiteChildren, ...testChildren];
    return suiteNode;
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
