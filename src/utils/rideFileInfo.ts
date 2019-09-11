import compiler, { ICompilationError, ICompilationResult } from '@waves/ride-js';
import { FilesStore } from '@stores/FilesStore';

export interface IRideFileInfo {
    readonly stdLibVersion: number,
    readonly type: 'account' | 'asset' | 'dApp',
    readonly maxSize: number,
    readonly maxComplexity: number,
    readonly compilation: ICompilationResult | ICompilationError,
    readonly size: number,
    readonly complexity: number
}

const limits = compiler.contractLimits;

export default function rideFileInfo(content: string, filesStore: FilesStore): IRideFileInfo {
    let info = {
        stdLibVersion: 2,
        type: 'account' as 'account' | 'asset' | 'dApp',
        maxSize: limits.MaxExprSizeInBytes,
        maxComplexity: limits.MaxComplexityByVersion(2),
        compilation: {error: 'default error'} as ICompilationResult | ICompilationError,
        size: 0,
        complexity: 0
    };

    try {
        const scriptInfo = compiler.scriptInfo(content);
        if ('error' in scriptInfo) {
            info.compilation = scriptInfo;
        } else {
            // Todo: fix this. compilation result should be provided by language service.
            const libraries = scriptInfo.imports.reduce((acc, libname) => {
                    try {
                        acc[libname] = filesStore.getFileContent(libname);
                    }catch (e) {
                        console.log(e)
                    }
                    return acc
                }, {} as Record<string, string>);
            info.compilation = compiler.compile(content, libraries);
            info.stdLibVersion = scriptInfo.stdLibVersion;
            info.type = scriptInfo.contentType === 2 ?
                'dApp' :
                scriptInfo.scriptType === 2 ?
                    'asset' :
                    'account';
            info.maxSize = scriptInfo.contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
            info.maxComplexity = limits.MaxComplexityByVersion(scriptInfo.stdLibVersion);
            info.size = 'result' in info.compilation ? info.compilation.result.size : 0;
            info.complexity = 'result' in info.compilation ? info.compilation.result.complexity : 0;
        }

    } catch (e) {
        console.error(e);
    }

    return info;
}
