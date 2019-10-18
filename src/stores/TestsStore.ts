import { observable, action, computed, runInAction } from 'mobx';
import SubStore from '@stores/SubStore';
import { testRunnerService } from '@services';
import { ITestMessage, ITestNode, findNodeByFullTitle } from '@services/TestRunnerService';
import { IJSFile } from '@stores/FilesStore';


export default class TestsStore extends SubStore {

    @observable testTree: ITestNode | null = null;
    @observable selectedNodeFullTitle: string = '';
    @observable file: IJSFile | null = null;
    @observable testFullTitle = '';

    @computed
    get fileName() {
        return this.file ? this.file.name : '';
    }

    @computed
    get fileId() {
        return this.file ? this.file.id : null;
    }

    @computed
    get rerunDisabled() {
        return !this.file || this.running;
    }

    @computed
    get info() {
        let info = {
            failed: 0,
            passed: 0,
            pending: 0,
            none: 0,
            get total() {
                return this.pending + this.failed + this.passed + this.none;
            }
        };
        if (this.testTree == null) return info;
        const go = (node: ITestNode) => {
            info[node.status] += 1;
            node.children.forEach(go);
        };
        go(this.testTree);
        return info;
    }

    @computed
    get running() {
        return this.info.pending > 0;
    }

    @computed
    get currentMessages(): ITestMessage[] {
        if (this.testTree == null) return [];

        function extractMessages(node: ITestNode): ITestMessage[] {
            return [...node.messages, ...node.children.reduce((acc, item) => [...acc, ...extractMessages(item)], [])]
                .sort((a, b) => a.timestamp - b.timestamp);
        }

        const node = findNodeByFullTitle(this.selectedNodeFullTitle, this.testTree);
        return node == null
            ? []
            : extractMessages(node);
    }

    @action
    async runTest(file: IJSFile, grep?: string) {

        const tree = await testRunnerService.runTest(file.content, this.rootStore.settingsStore.consoleEnv, grep);
        runInAction(() => {
            if (grep != null) {
                this.testFullTitle = grep;
            }
            this.file = file;
            this.testTree = observable(tree);
        });
    }

    @action
    rerunTest() {

    }

    @action
    stopTest() {

    }

    @action
    selectNode(fullTitle: string) {
        this.selectedNodeFullTitle = fullTitle;
    }
}


