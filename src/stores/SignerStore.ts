import { action, computed, observable } from 'mobx';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';
import { issue, setAssetScript, setScript } from '@waves/waves-transactions';
import { FILE_TYPE } from '@stores';

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

    get setScriptTemplate(): string | null {
        const {settingsStore, filesStore} = this.rootStore!;
        const file = filesStore.currentFile;
        if (!file || file.type !== FILE_TYPE.RIDE || 'error' in file.info.compilation) return null;

        const chainId = settingsStore!.defaultNode!.chainId;
        const base64 = file.info.compilation.result.base64;
        const additionalFee = settingsStore!.defaultAdditionalFee;

        let tx;
        if (file.info.type === 'account' || 'dApp') {
            tx = setScript({
                script: base64,
                chainId: chainId,
                additionalFee,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
            });
            delete tx.senderPublicKey;
            delete tx.id;
        } else if (file.info.type === 'asset') {
            tx = setAssetScript({
                assetId: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', //Dummy assetId
                script: base64,
                chainId: chainId,
                additionalFee,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', // Dummy senderPk Only to create tx
            });
            delete tx.senderPublicKey;
            delete tx.assetId;
            delete tx.id;
        } else {
            throw new Error(`Incorrect file.info.type for ride file: ${file.info.type}`);
        }

        return JSON.stringify(tx, null, 2);
    }

    get issueTemplate(): string | null {
        const {settingsStore, filesStore} = this.rootStore;
        const file = filesStore.currentFile;
        if (!file || file.type !== FILE_TYPE.RIDE || 'error' in file.info.compilation) return null;
        const chainId = settingsStore!.defaultNode!.chainId;
        const base64 = file.info.compilation.result.base64;
        const tx = issue({
            script: 'base64:' + base64,
            name: 'test',
            description: 'test',
            quantity: 1000,
            reissuable: true,
            chainId: chainId,
            senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
        });
        delete tx.senderPublicKey;
        delete tx.id;
        delete tx.description;
        delete tx.name;
        delete tx.quantity;
        return JSON.stringify(tx, null, 2);
    }

    @action
    setTxJson(newTxJson: string) {
        this.txJson = newTxJson;
    }
}

export default SignerStore;
