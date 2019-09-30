import { observable, action, computed } from 'mobx';

import SubStore from '@stores/SubStore';
import { FILE_TYPE } from '@stores/FilesStore';

interface IRepl {
    name: string,
    instance: any,
}

export default class CompilationStore extends SubStore {
    @computed
    get compilation() {
        const file = this.rootStore.filesStore.currentFile;

        const compilation: { type: 'error' | 'success', message: string }[] = [];

        if (file && file.type !== FILE_TYPE.MARKDOWN && file.info) {
            if ('error' in file.info.compilation) {
                compilation.length = 0;
                compilation.push({type: 'error', message: file.info.compilation.error});

            } else {
                compilation.length = 0;
                compilation.push({type: 'success', message: `${file.name} file compiled successfully`});
                'complexity' in file.info.compilation.result && compilation.push({
                    type: 'success',
                    message: `Script complexity ${file.info.compilation.result.complexity}`
                });
            }
        }
        return compilation;
    }

    @computed
    get compilationLabel(){
        return (this.compilation.length || 0).toString()
    }

    @computed
    get isCompilationError(){
        return this.compilation.some(({type}) => type === 'error')
    }
}


