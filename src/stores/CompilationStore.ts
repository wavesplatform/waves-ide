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

        let compilation: { type: 'error' | 'success', message: string }[] = [];

        if (file && file.type !== FILE_TYPE.MARKDOWN && file.info) {
            const {name, info} = file;
            if ('error' in info.compilation) {
                compilation.length = 0;
                compilation.push({type: 'error', message: info.compilation.error});

            } else {
                compilation.length = 0;
                compilation.push({type: 'success', message: `${name} file compiled successfully`});
                'complexity' in info.compilation.result && compilation.push({
                    type: 'success',
                    message: `Script complexity ${info.compilation.result.complexity}`
                });
                if ('complexityByFunc' in info.compilation.result && info.compilation.result.complexityByFunc) {
                    compilation = [...compilation, ...Object.entries(info.compilation.result.complexityByFunc)
                        .map(([func, complexity]) => ({
                            type: 'success' as 'success',
                            message: `${func} complexity ${complexity}`
                        }))
                    ];
                }

            }
        }
        return compilation;
    }

    @computed
    get compilationLabel() {
        return (this.compilation.length || 0).toString();
    }

    @computed
    get isCompilationError() {
        return this.compilation.some(({type}) => type === 'error');
    }
}


