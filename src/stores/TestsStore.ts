import { observable, action, computed, runInAction } from 'mobx';
import SubStore from '@stores/SubStore';
import { testRunnerService } from '@services';
import { ITestMessage, ITestNode } from '@services/TestRunnerService';
import { IJSFile } from '@stores/FilesStore';


export default class TestsStore extends SubStore {

    @observable testTree: ITestNode = testRunnerService.currentTestNode;
    @observable file: IJSFile | null = null;

    @computed
    get fileName(){
        return this.file ? this.file.name : '';
    }

    @computed
    get rerunDisabled(){
        return !this.file || this.running;
    }

    @computed
    get info() {
        let info = {
            failed: 0,
            passed: 0,
            pending: 0,
            get total() {
                return this.pending + this.failed + this.passed;
            }
        };
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
        return [];
    }

    @action
    async runTest(file: IJSFile, grep?: string) {
        const tree = await testRunnerService.runTest(file.content, this.rootStore.settingsStore.consoleEnv, grep);
        runInAction(() => {
            this.file = file;
            this.testTree = observable(tree);
        });
    }

    @action
    rerunTest(){

    }

    stopTest(){

    }
}


