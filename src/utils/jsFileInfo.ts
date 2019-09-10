import { testRunner } from '@services';

export interface ICompilationResult {
    result: ISuite
}

export interface ITestMessage {
    message: any
    type: 'log' | 'error' | 'response'
}

export type TTestPath = { type: 'tests' | 'suites', index: number };

export interface ITest {
    fullTitle: string
    title: string
    status: 'failed' | 'passed' | 'pending'
    messages: ITestMessage[]
    path: TTestPath[]
}

export interface ISuite extends ITest {
    suites: ISuite[]
    tests: ITest[]
}

export const isSuite = (item: ISuite | ITest): item is ISuite => 'suites' in item || 'tests' in item;

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
