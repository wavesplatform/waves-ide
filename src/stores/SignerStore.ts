import { observable, action } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore'; 

class SignerStore extends SubStore {
    @observable txJson: string;

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState == null) {
            this.txJson = '';
        } else {
            this.txJson = initState.txJson;
        }
    }

    @action
    setTxJson(newTxJson: string) {
        this.txJson = newTxJson;
    }
}

export default SignerStore;
