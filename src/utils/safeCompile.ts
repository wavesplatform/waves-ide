import {compile} from '@waves/ride-js'

export interface ICompilationResult {
    result?: ArrayBuffer
    error?: string
    ast?: any
}

export function safeCompile(code: string) {
    let result: ICompilationResult
    try {
        result = compile(code)
    }catch (e) {
        if (typeof e === 'object'){
            result = {
                error: e.message
            }
        }else {
            result = {
                error: e
            }
        }
    }
    return result
}