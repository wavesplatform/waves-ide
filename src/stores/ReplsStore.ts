import { observable, action } from 'mobx';

import SubStore from '@stores/SubStore'; 

interface IRepl {
    name: string,
    instance: any,
}

class ReplsStore extends SubStore {
    @observable repls: { [name: string]: IRepl } = {};

    @action
    addRepl(repl: IRepl) {
        this.repls[repl.name] = repl;
    }
}

export {
    ReplsStore,
    IRepl
};
