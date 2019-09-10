import { testRunner } from '@services';

export interface ICompilationResult {
    result: ISuite
}

export interface ITest {
    fullTitle: string
    title: string
}

export interface ISuite extends ITest {
    suites: ISuite[]
    tests: ITest[]
    messages: {message: string, type: string}[]
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
