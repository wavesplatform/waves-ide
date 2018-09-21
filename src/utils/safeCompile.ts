import {compile} from '@waves/ride-js'
import {ICompilationResult} from "../state";

export function safeCompile(code) {
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