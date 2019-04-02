import Mocha from 'mocha';

import { compileTest } from '@utils/testRunner';

export interface ICompilationResult {
    result: Mocha 
}

export interface ICompilationError {
    error: string //Сделать ошибку типо Error
}

export interface IJSFileInfo {
    readonly compilation: ICompilationResult | ICompilationError,
}

export default async function getJSFileInfo(content: string): Promise<IJSFileInfo> {
    try {
        const result = await compileTest(content);

        return {
            compilation: {
                result
            }
        };
    } catch (error) {        
        return {
            compilation: {
                error
            }
        };
    }
}
