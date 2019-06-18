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
    try {
        const result = await testRunner.compileTest(content);

        return {
            compilation: {
                result
            }
        };
    } catch (error) {        
        return {
            compilation: {
                error: error.message
            }
        };
    }
}
