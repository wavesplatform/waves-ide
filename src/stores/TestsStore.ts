import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';


class TestsStore extends SubStore {
    @observable isRunning: boolean = false;

    @observable result: any;

    constructor(rootStore: RootStore) {
        super(rootStore);
    }

}

export {
    TestsStore
};
