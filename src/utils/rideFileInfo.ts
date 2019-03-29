import compiler, { ICompilationError, ICompilationResult } from '@waves/ride-js';

export interface IRideFileInfo {
    readonly stdLibVersion: number,
    readonly type: 'account' | 'asset' | 'dApp',
    readonly maxSize: number,
    readonly maxComplexity: number,
    readonly compiled: ICompilationResult | ICompilationError,
    readonly size: number,
    readonly estimate: number
}

const limits = compiler.contractLimits;

export default function rideFileInfo(content: string): IRideFileInfo {
    let info = {
        stdLibVersion: 2,
        type: 'account' as 'account' | 'asset' | 'dApp',
        maxSize: limits.MaxExprSizeInBytes,
        maxComplexity: limits.MaxExprComplexity,
        compiled: {error: 'default error'} as ICompilationResult | ICompilationError,
        size: 0,
        estimate: 0
    };

    try {
        const scriptInfo = compiler.scriptInfo(content);
        info.compiled = compiler.compile(content);
        info.stdLibVersion = scriptInfo.stdLibVersion;
        info.type = scriptInfo.contentType === 2 ?
            'dApp' :
            scriptInfo.scriptType === 2 ?
                'asset' :
                'account';
        info.maxSize = scriptInfo.contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
        info.maxComplexity = scriptInfo.contentType === 2 ? limits.MaxContractComplexity : limits.MaxExprComplexity;
        info.size = 'result' in info.compiled ? info.compiled.result.size : 0;
    } catch (e) {
        console.error(e);
    }

    return info;
}