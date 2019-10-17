import { observable, action, computed, runInAction } from 'mobx';
import SubStore from '@stores/SubStore';
import { testRunnerService } from '@services';
import { ITestNode } from '@services/TestRunnerService';


export default class TestsStore extends SubStore {

    @observable testTree: ITestNode = testRunnerService.currentTestNode;

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

    @action
    async runTest(code: string, grep?: string) {
        const tree = await testRunnerService.runTest(code, this.rootStore.settingsStore.consoleEnv, grep);
        runInAction(() => this.testTree = observable(tree));
    }
}


