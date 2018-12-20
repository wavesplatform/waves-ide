import {compile} from '@waves/ride-js'
import base64 from 'base64-js'
import {compileContract} from '/Users/siem/IdeaProjects/ride-js/src'

export interface ICompilationResult {
    result?: string
    error?: string
    ast?: any
}

function safeCompileWrapper(compile:(code:string)=>any){
    return (code :string) => {
        let result: any
        try {
            result = compile(code);
            if (result.result) result.result = base64.fromByteArray(new Uint8Array(result.result))
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
}

export const safeCompile = safeCompileWrapper(compile);

export const safeCompileContract = safeCompileWrapper(compileContract);