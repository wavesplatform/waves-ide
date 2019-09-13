import compiler, { ICompilationError, ICompilationResult } from '@waves/ride-js';

export type TRideFileType = 'account' | 'asset' | 'dApp' | 'library';

export interface IRideFileInfo {
    readonly stdLibVersion: number,
    readonly type: TRideFileType,
    readonly maxSize: number,
    readonly maxComplexity: number,
    readonly compilation: ICompilationResult | ICompilationError,
    readonly size: number,
    readonly complexity: number
}

const limits = compiler.contractLimits;

export default function rideFileInfo(content: string): IRideFileInfo {
    let info = {
        stdLibVersion: 2,
        type: 'account' as TRideFileType,
        maxSize: limits.MaxExprSizeInBytes,
        maxComplexity: limits.MaxComplexityByVersion(2),
        compilation: {error: 'default error'} as ICompilationResult | ICompilationError,
        size: 0,
        complexity: 0
    };

    try {
        const scriptInfo = compiler.scriptInfo(content);
        if ('error' in scriptInfo) throw 'invalid scriptInfo';
        info.compilation = compiler.compile(content);
        info.stdLibVersion = scriptInfo.stdLibVersion;
        switch (scriptInfo.contentType) {
            case 2:
                info.type = 'dApp';
                break;
            case 3:
                info.type = 'library';
                break;
            default:
                info.type = scriptInfo.scriptType === 2 ? 'asset' : 'account';
                break;
        }
        info.maxSize = scriptInfo.contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
        info.maxComplexity = limits.MaxComplexityByVersion(scriptInfo.stdLibVersion);
        info.size = 'result' in info.compilation ? info.compilation.result.size : 0;
        info.complexity = 'result' in info.compilation ? info.compilation.result.complexity : 0;
    } catch (e) {
        console.error(e);
    }

    return info;
}
