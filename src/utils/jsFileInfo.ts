import Mocha from 'mocha';

import { testRunner } from '@services';

export interface ICompilationResult {
    result: Mocha
}

export interface ICompilationError {
    error: string
}

export interface IJSFileInfo {
    readonly compilation: ICompilationResult | ICompilationError,
}

export default async function getJSFileInfo(content: string): Promise<IJSFileInfo> {
    const compilation = await testRunner.compileTest(content);
    return {
        compilation
    };
}
