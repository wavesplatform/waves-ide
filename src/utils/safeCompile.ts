import {compile} from '@waves/ride-js'
import base64 from 'base64-js'


export interface ICompilationResult {
    result?: string
    error?: string
    ast?: any
}

export function safeCompile(code: string): ICompilationResult {
    let result: any
    try {
        result = compile(code);
        if (result.result) result.result = base64.fromByteArray(Uint8Array.from(result.result))
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