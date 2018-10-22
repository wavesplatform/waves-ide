import {compile} from '@waves/ride-js'
import {bufferToBase64} from "./bufferToBase64";

export interface ICompilationResult {
    result?: string
    error?: string
    ast?: any
}

export function safeCompile(code: string): ICompilationResult {
    let result: any
    try {
        result = compile(code)
        if (result.result) result.result = bufferToBase64(new Uint8Array(result.result))
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