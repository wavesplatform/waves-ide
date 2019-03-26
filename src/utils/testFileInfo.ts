import { Runner, Suite, Test } from 'mocha';

import { compileTest } from '@utils/testRunner';

export interface ICompilationResult extends Runner {

}

export interface ICompilationError extends Error {
    message: string
}


export interface ITestFileInfo {
    readonly isCompiled: boolean,
    readonly compililation: ICompilationResult | ICompilationError,
}

export default async function getTestFileInfo(content: string): Promise<ITestFileInfo> {
    try {
        const result = await compileTest(content);

        return {
            isCompiled: true,
            compililation: result
        };
    } catch (error) {        
        return {
            isCompiled: false,
            compililation: error
        };
    }
}
