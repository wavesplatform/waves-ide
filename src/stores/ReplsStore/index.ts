import { observable, action, computed } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

import { IRepl } from '@src/types';

class ReplsStore extends SubStore {
    @observable repls: { [name: string]: IRepl } = {};

    @action
    addRepl(repl: IRepl) {
        this.repls[repl.name] = repl;
    }
}

export default ReplsStore;
