interface IFlattenedCompilationResult {
    ast?: object
    base64?: string
    bytes?: Uint8Array
    size: number
    complexity?: number
    verifierComplexity?: number
    callableComplexities?: Record<string, number>
    userFunctionComplexities?: Record<string, number>
    globalVariableComplexities?: Record<string, number>
    error?: string
}

interface ICompilationResult {
    result: {
        ast: object
        base64: string
        bytes: Uint8Array
        size: number
        complexity: number
        verifierComplexity?: number
        callableComplexities?: Record<string, number>
        userFunctionComplexities?: Record<string, number>
        globalVariableComplexities?: Record<string, number>
    }
}

interface ICompilationError {
    error: string
    ast?: object
    base64: string
    bytes: Uint8Array
    size: number
    complexity: number
    verifierComplexity?: number
    callableComplexities?: Record<string, number>
    userFunctionComplexities?: Record<string, number>
    globalVariableComplexities?: Record<string, number>
}

interface ICompilation {
    ast?: object
    base64?: string
    bytes?: Uint8Array
    size?: number
    complexity?: number
    verifierComplexity?: number
    callableComplexities?: Record<string, number>
    userFunctionComplexities?: Record<string, number>
    globalVariableComplexities?: Record<string, number>
    error?: string
}

type TRideFileType = 'account' | 'asset' | 'dApp' | 'library';

interface IRideFileInfo {
    stdLibVersion: number,
    type: TRideFileType,
    maxSize: number,
    compilation: ICompilation,
    maxComplexity: number,
    maxCallableComplexity: number,
    maxAccountVerifierComplexity: number,
    maxAssetVerifierComplexity: number,
    scriptType: number
    contentType: number
    imports: []
}

const worker = (() => {
        (self as any).importScripts([`${origin}/vendor/@waves/ride-js/dist/ride.min.js`]);
        (self as any).importScripts([`${origin}/ride-language.bundle.js`]);
        const LspService = (self as any).RideLanguageServer.LspService;
        const RideJS = (self as any).RideJS;
        const languageService = new LspService();

        console.log('Worker RideJS ver: ', RideJS.version);

        const flattenCompilationResult = (compiled: ICompilationResult | ICompilationError): IFlattenedCompilationResult => {
            let result: IFlattenedCompilationResult | undefined = undefined;

            if ('error' in compiled) {
                result = compiled
            } else {
                result = compiled.result;
            }

            return result;
        }

        function compileRideFile(content: string, needCompaction: boolean, removeUnused: boolean, libraries?: Record<string, string>) {
            const limits = RideJS.contractLimits;

            let info: IRideFileInfo = {
                stdLibVersion: 3,
                type: 'account',
                maxSize: limits.MaxExprSizeInBytes,
                maxComplexity: limits.MaxComplexityByVersion(3),
                maxCallableComplexity: 0,
                maxAccountVerifierComplexity: 0,
                maxAssetVerifierComplexity: 0,
                compilation: {
                    verifierComplexity: 0
                },
                contentType: 2,
                scriptType: 1,
                imports: []
            };

            try {
                const scriptInfo = RideJS.scriptInfo(content);

                if ('error' in scriptInfo) throw 'invalid scriptInfo';
                
                const { stdLibVersion, contentType, scriptType, imports } = scriptInfo;
                info.stdLibVersion = stdLibVersion;
                info.contentType = contentType;
                info.scriptType = scriptType;
                info.imports = imports;
                info.maxSize = contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
                info.maxComplexity = limits.MaxComplexityByVersion(stdLibVersion);
                info.maxCallableComplexity = limits.MaxCallableComplexityByVersion(stdLibVersion)

                switch (contentType) {
                    case 1:
                        if (scriptType === 2) {
                            info.type = 'asset';
                            info.maxAssetVerifierComplexity = limits.MaxAssetVerifierComplexityByVersion(stdLibVersion);
                        } else {
                            info.type = 'account';
                            info.maxAccountVerifierComplexity = limits.MaxAccountVerifierComplexityByVersion(stdLibVersion);
                        }
                        break;
                    case 2:
                        info.type = 'dApp';
                        info.maxAccountVerifierComplexity = limits.MaxAccountVerifierComplexityByVersion(stdLibVersion);
                        break;
                    case 3:
                        info.type = 'library';
                        break;
                }

                const compilationResult: IFlattenedCompilationResult = flattenCompilationResult(RideJS.compile(content, 3, needCompaction, removeUnused, libraries));

                info.compilation = compilationResult;
            } catch (e) {
                if (typeof e === 'string') {
                    info.compilation = {
                        error: e,
                        verifierComplexity: 0
                    }
                } else {
                    info.compilation = {
                        error: 'unknown error',
                        verifierComplexity: 0
                    }
                }
            }

            return info;
        }



        self.addEventListener('message', e => {
            if (!e) return;
            const {data, msgId, type} = e.data;
            let result: any = null;
            try {
                const
                    textDocument = LspService.TextDocument
                        .create(data.uri, data.languageId, data.version || 1, data.content),
                    convertedPosition = {
                        line: (data.lineNumber || 0) - 1,
                        character: (data.column || 0) - 1
                    };
                switch (type) {
                    case'validateTextDocument':
                        result = languageService.validateTextDocument(textDocument, data.libraries);
                        break;
                    case'completion':
                        result = languageService.completion(textDocument, convertedPosition);
                        break;
                    case'hover':
                        result = languageService.hover(textDocument, convertedPosition);
                        break;
                    case'signatureHelp':
                        result = languageService.signatureHelp(textDocument, convertedPosition);
                        break;
                    case'definition':
                        result = languageService.definition(textDocument, convertedPosition);
                        break;
                    case'compile':
                        result = compileRideFile(data.content, data.needCompaction, data.removeUnused, data.libraries);
                        break;
                }
            } catch (e) {
                console.error(e);
            }
            postMessage({result, msgId}, undefined as any);
        });
    })
;

export default class RideInfoCompilerWorker {
    constructor() {
        const code = worker.toString();
        const blob = new Blob(['(' + code + ')()']);
        return new Worker(URL.createObjectURL(blob));
    }
}
