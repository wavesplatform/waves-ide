import { computed } from 'mobx';

import SubStore from '@stores/SubStore';
import { FILE_TYPE } from '@stores/FilesStore';
import { IRideFileInfo } from '@services/rideLanguageService';

interface IRepl {
    name: string,
    instance: any,
}

interface ICompilationMessage {
    type: 'error' | 'success',
    message: string 
}

export default class CompilationStore extends SubStore {
    getFunctionsComplexityMessages = (info: IRideFileInfo, messages: ICompilationMessage[], type: 'error' | 'success' = 'success') => {
        const contentTypeTitle = info.contentType === 1 ? 'Verifier' : 'Script'

        const callableFunctionsComplexities = Object.entries(info.compilation.callableComplexities || {})
            .reduce((complexities, [func, complexity]) => ([...complexities, `\n\n \u2000 \u2000 ${func} ${complexity}`])
            , []);

        const stateCallFunctionsComplexities = Object.entries(info.compilation.stateCallsComplexities || {})
            .reduce((complexities, [func, complexity]) => ([...complexities, `\n\n \u2000 \u2000 ${func} ${complexity}`])
                , []);

        const userFunctionComplexities = Object.entries(info.compilation.userFunctionComplexities || {})
            .reduce((complexities, [func, complexity]) => ([...complexities, `\n\n \u2000 \u2000 ${func} ${complexity}`])
            , []);

        const globalVariableComplexities = Object.entries(info.compilation.globalVariableComplexities || {})
            .reduce((complexities, [func, complexity]) => ([...complexities, `\n\n \u2000 \u2000 ${func} ${complexity}`])
            , []);

        const parts = [
            'complexity' in info.compilation ? `${contentTypeTitle} complexity ${info.compilation.complexity}` : undefined,
            callableFunctionsComplexities.length > 0 ? `\n\nCallable functions complexity: ${callableFunctionsComplexities.join('')}` : undefined,
            stateCallFunctionsComplexities.length > 0 ? `\n\nState calls complexity: ${stateCallFunctionsComplexities.join('')}` : undefined,
            userFunctionComplexities.length > 0 ? `\n\nUser functions complexity: ${userFunctionComplexities.join('')}` : undefined,
            globalVariableComplexities.length > 0 ? `\n\nGlobal variables complexity: ${globalVariableComplexities.join('')}` : undefined
        ].filter(part => !!part);

        (parts.length > 0 ) && messages.push({
            type,
            message: parts.join('')
        });

         info.compilation.verifierComplexity && messages.push({
            type,
            message: `Verifier complexity ${info.compilation.verifierComplexity}`
        });

        return messages;
    }

    @computed
    get compilation() {
        const file = this.rootStore.filesStore.currentFile;
        let compilation: ICompilationMessage[] = [];
        const messages: ICompilationMessage[] = [];

        if (file && file.type === FILE_TYPE.JAVA_SCRIPT && file.info) {
            const { name, info } = file;
            if ('error' in info.compilation && info.compilation.error) {
                info.compilation
                compilation.length = 0;
                compilation.push({ type: 'error', message: info.compilation.error });
            } else {
                compilation.length = 0;
                
                compilation.push({ type: 'success', message: `${name} file compiled successfully` });
            }
        }

        if (file && file.type === FILE_TYPE.RIDE && file.info) {
            const { name, info } = file;
            if ('error' in info.compilation && info.compilation.error) {
                compilation.length = 0;
                compilation.push({ type: 'error', message: info.compilation.error });
                compilation = [
                    ...compilation,
                    ...this.getFunctionsComplexityMessages(info, messages, 'error')
                ];

            } else {
                compilation.length = 0;

                compilation.push({ type: 'success', message: `${name} file compiled successfully` });

                compilation = [
                    ...compilation,
                    ...this.getFunctionsComplexityMessages(info, messages),
                ];
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


