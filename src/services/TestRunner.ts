import { Runner, Suite, Test } from 'mocha';
import { action, computed, observable } from 'mobx';
import { injectTestEnvironment } from '@services/testRunnerEnv';
import { IJSFile } from '@stores';
import { ICompilationResult, ISuite, ITest, ITestMessage, TTestPath } from '@utils/jsFileInfo';
import Hook = Mocha.Hook;

const isFirefox = navigator.userAgent.search('Firefox') > -1;

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

    @observable private currentResultTreeNode: ISuite | ITest | null = null;

    @observable selectedPath: TTestPath[] = [];

    @computed get currentMessages (): ITestMessage[]{
        const path = this.getNodeByPath(this.selectedPath);
        return (path && path.messages) || [];
    }

    @observable isRunning = false;

    @observable info: TTestRunnerInfo = {
        fileId: null,
        fileName: null,
        tree: null,
        testsCount: 0,
        passes: 0,
        failures: 0
    };

    @action
    private pushMessage = (msg: ITestMessage) => {

        const writeMessageToNode = (path: TTestPath[], message: ITestMessage) => {
            const node = this.getNodeByPath(path);
            node.messages = node.messages ? [...node.messages, message] : [message];
        };

        if (this.currentResultTreeNode) {//to display all messages in parental suites
            const path = [...this.currentResultTreeNode.path];
            path.pop();
            while (path.length > 0) {
                writeMessageToNode(path, msg);
                if (path.length > 0) path.pop();
            }
            //to display all messages in root suite
            this.currentResultTreeNode.path.length > 0 && writeMessageToNode([], msg);
            this.currentResultTreeNode.messages.push(msg);
        }
    };

    @action private setStatus = (status: 'failed' | 'passed' | 'pending') =>
        this.currentResultTreeNode && (this.currentResultTreeNode.status = status);

    getNodeByPath = (path: TTestPath[]) => path.length === 0
        ? this.info.tree
        : path.reduce((accumulator, {type, index}) => (accumulator as any)[type][index], this.info.tree);


    @action
    private setCurrentResultTreeNode = (testOrSuite: Test | Suite) => {
        const path = this.getTestPath(testOrSuite);
        const node = this.getNodeByPath(path);
        this.currentResultTreeNode = node;
        if (node && !node.messages) node.messages = [];
        node.path = path;
    };

    @action
    private clearCurrentResultTreeNode = () => this.currentResultTreeNode = null;

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

        const sandbox = await this.createSandbox();
        const iframeWindow = sandbox.contentWindow;

        try {
            if (grep) {
                iframeWindow.mocha.grep(`/${grep}/`);
            }
            this.selectedPath = [];
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
        contentWindow.console = {
            log: (...args: any) => args.map((message: any) => this.pushMessage({type: 'log', message})),
            error: (...args: any) => args.map((message: any) => this.pushMessage({type: 'error', message})),
            dir: (...args: any) => args.map((message: any) => this.pushMessage({type: 'log', message})),
            info: (...args: any) => args.map((message: any) => this.pushMessage({type: 'log', message})),
            warn: (...args: any) => args.map((message: any) => this.pushMessage({type: 'log', message})),
            assert: (...args: any) => args.map((message: any) => this.pushMessage({type: 'log', message})),
            debug: () => {
            }, //fixme
            clear: () => {
            }, //fixme
        };


        return iframe;
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

    private getTestPath = (testOrSuite: Test | Suite) => {
        let path: TTestPath[] = [];
        let parent = testOrSuite.parent;
        let current = testOrSuite;
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
        const check = (testOrSuite: Test | Suite): boolean => ('tests' in testOrSuite)
            ? testOrSuite.tests.every(check) && testOrSuite.suites.every(check)
            : (testOrSuite as any).status === 'passed';
        const path = this.getTestPath(data);
        const suite = this.getNodeByPath(path);
        return check(suite);
    };

    @action
    private _reporter = (runner: Runner, frameId: string) => {
        this.isRunning = true;
        this.info.passes = 0;
        this.info.failures = 0;

        runner.on('suite', (suite: Suite) => {
            this.setCurrentResultTreeNode(suite);
            if (suite.fullTitle) {
                this.pushMessage({type: 'log', message: `\ud83c\udfc1 Start suite: ${suite.title}`});
            }
            this.setStatus('pending');
        });

        runner.on('test', (test: Test) => {
            this.setCurrentResultTreeNode(test);
            const message: ITestMessage = {type: 'log', message: `\ud83c\udfc1 Start test: ${test.titlePath().pop()}`};
            this.pushMessage(message);
            this.setStatus('pending');
        });

        runner.on('suite end', (suite: Suite) => {
            this.setCurrentResultTreeNode(suite);
            const message: ITestMessage = {type: 'log', message: `\u2705 End suite: ${suite.title}`};
            this.pushMessage(message);
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
                return;
            }
            this.info.failures++;
            const message: ITestMessage =
                {type: 'log', message: `\u274C Fail test: ${test.titlePath().pop()}. Error message: ${err.message}.`};
            this.pushMessage(message);
            this.pushMessage({type: 'error', message: err});
            this.setStatus('failed');
        });

        runner.on('end', () => {
            this.getNodeByPath([]).messages.push({
                type: 'log',
                message: `\ud83d\udd1a End: ${this.info.passes} of ${this.info.passes + this.info.failures} passed.`
            });
            this.clearCurrentResultTreeNode();
            this.isRunning = false;
            this.runner = null;
            const domElement = document.getElementById(frameId);
            domElement && domElement.parentNode!.removeChild(domElement);
        });
    };
}

export default new TestRunner();
