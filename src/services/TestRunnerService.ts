import { Suite, Test } from 'mocha';
import { injectTestEnvironment } from '@services/testRunnerEnv';
import { ICompilationError, ICompilationResult, ISuite } from '@utils/jsFileInfo';
import { observable } from 'mobx';
import Hook = Mocha.Hook;
import Runner = Mocha.Runner;
import { TSetupAccountsFunc } from '@waves/js-test-env/augment';
import { NETWORKS } from '@src/constants';
import { libs } from '@waves/waves-transactions';

const isFirefox = navigator.userAgent.search('Firefox') > -1;

export interface ITestMessage {
    message: any
    timestamp: number
    type: 'log' | 'error' | 'response'
    html?: boolean
}

export interface ITestNode {
    parent?: ITestNode | null
    title: string
    fullTitle: string
    messages: ITestMessage[]
    status: 'pending' | 'passed' | 'failed' | 'none'
    type: 'suite' | 'test'
    children: ITestNode[]
}

export class TestRunnerService {
    currentTestNode: ITestNode = createNode({type: 'suite', title: ''});
    runner: Runner | null = null;

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
            return {
                parent: null,
                status: 'failed',
                title: '',
                fullTitle: '',
                type: 'suite',
                children: [],
                messages: [{type: 'error', message: compilationResult.error, timestamp: Date.now()}]

            } as ITestNode;
        }

        const tree = convertTree(compilationResult.result);
        this.currentTestNode = tree;
        this.runner = (iframeWindow.mocha as Mocha).run();

        this.runner.on('suite', (suite: Suite) => {
            const node = findNodeByFullTitle(suite.fullTitle(), tree);
            if (node && !suite.root) {
                node.status = 'pending';
                this.currentTestNode = node;
                this.currentTestNode.messages.push(cm('log', `\ud83c\udfc1 Start suite: ${suite.title}`));
            }
        });

        this.runner.on('test', (test: Test) => {
            const node = findNodeByFullTitle(test.fullTitle(), tree);
            if (node) {
                this.currentTestNode = node;
                node.status = 'pending';
                node.messages.push(cm('log', `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`));
            }
        });

        this.runner.on('suite end', (suite: Suite) => {
            const node = findNodeByFullTitle(suite.fullTitle(), tree);
            if (node == null) {
                console.error(`Failed to find node ${suite.fullTitle()}`);
                return;
            }
            if (!suite.root) {
                node.messages.push(cm('log', `\u2705 End suite: ${suite.title}`));
            }
            node.status = node.children
                .some(ch => ch.status === 'failed') ? 'failed' : 'passed';
        });

        this.runner.on('pass', (test: Test) => {
            this.currentTestNode.messages.push(cm('log', `\u2705 Pass test: ${test.titlePath().pop()}`));
            this.currentTestNode.status = 'passed';
        });

        this.runner.on('fail', (test: Test | Hook | Suite, err: any) => {
            if ('type' in test && test.type === 'hook') {
                const m1 = cm('log', `\u274C Fail: ${test.title}`);
                const m2 = cm('error', err);
                const hookNode: ITestNode = createNode({
                    type: 'test',
                    title: 'Before all hook',
                    parent: this.currentTestNode
                });
                hookNode.status = 'failed';
                hookNode.messages.push(m1);
                hookNode.messages.push(m2);

                this.currentTestNode.children.unshift(hookNode);

            } else {
                const message = cm('log',
                    `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`);

                this.currentTestNode.messages.push(message);
                this.currentTestNode.messages.push(cm('error', err));
            }

            this.currentTestNode.status = 'failed';
        });

        this.runner.on('end', () => {
            // tree.messages.push({
            //     type: 'log',
            //     message: `\ud83d\udd1a End: ${this.info.passes} of ${this.info.passes + this.info.failures} passed.`
            // });
            sandbox.dispose();
            this.runner = null;
        });

        return tree;
    }

    stopTest() {
        if (!this.runner) return;
        this.runner.abort();
        this.runner.currentRunnable!.emit('error', new Error('User stopped test'));
        this.runner.emit('end');

        let parent = this.currentTestNode.parent;
        while (parent) {
            parent.status = 'failed';
            parent = parent.parent;
        }

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


        // Create wrapper that prints explorer links to generated accounts
        const systemNode = Object.values(NETWORKS).find(n => n.chainId === env.CHAIN_ID);
        const setupAccountsWrapper = systemNode
            ? (f: TSetupAccountsFunc): TSetupAccountsFunc => async (balances, options) => {
                const accs = await f(balances, options);
                Object.entries(accs).forEach(([name, seed]) => {
                    const link = `${systemNode.explorer}/address/${libs.crypto.address(seed, systemNode.chainId)}`;
                    const message = `<a href=${link} target="_blank" rel="noopener noreferrer">${link}</a>`;
                    this.currentTestNode.messages.push({type: 'log', message, timestamp: Date.now(), html: true});
                });
                return accs;
            }
            : undefined;

        // Bind functions
        injectTestEnvironment(contentWindow, setupAccountsWrapper);

        // Bind end variables
        contentWindow.env = env;

        // Bind console
        contentWindow.console = {
            log: (...message: any) => this.currentTestNode.messages.push(cm('log', message)),
            error: (...message: any) => this.currentTestNode.messages.push(cm('error', message)),
            dir: (...message: any) => this.currentTestNode.messages.push(cm('log', message)),
            info: (...message: any) => this.currentTestNode.messages.push(cm('log', message)),
            warn: (...message: any) => this.currentTestNode.messages.push(cm('log', message)),
            assert: (...message: any) => this.currentTestNode.messages.push(cm('log', message)),
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

export function findNodeByFullTitle(fullTitle: string, tree: ITestNode): ITestNode | null {
    if (fullTitle === '') return tree;
    const nextNode = tree.children.find(child => fullTitle.startsWith(child.title));
    if (!nextNode) return null;
    return findNodeByFullTitle(fullTitle.slice(nextNode.title.length + 1), nextNode);

}

const cm = (type: ITestMessage['type'], message: any) => ({type, message, timestamp: Date.now()});

const createNode = ({type, title, parent}: Pick<ITestNode, 'type' | 'title' | 'parent'>): ITestNode => observable({
    children: [],
    type,
    parent,
    status: 'none',
    title,
    messages: [],
    get fullTitle() {
        let result = title;
        let parent = this.parent;
        while (parent && parent.parent != null) { // While parent is not root node
            result = `${parent.title} ${result}`;
            parent = parent.parent;
        }
        return result;
    }
});

function convertTree(suite: ISuite): ITestNode {
    const suiteNode = createNode({type: 'suite', title: suite.title});
    const testChildren = suite.tests.map(t => createNode({type: 'test', title: t.title, parent: suiteNode}));
    const suiteChildren = suite.suites.map(s => convertTree(s));
    suiteChildren.forEach(s => s.parent = suiteNode);
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

const testRunnerService = new TestRunnerService();
export default testRunnerService;
