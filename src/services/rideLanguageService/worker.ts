const worker = (() => {
        (self as any).importScripts([`${origin}/vendor/@waves/ride-js/dist/ride.min.js`]);
        (self as any).importScripts([`${origin}/ride-language.bundle.js`]);
        const LspService = (self as any).RideLanguageServer.LspService;
        const RideJS = (self as any).RideJS;
        const languageService = new LspService();

        function compileRideFile(content: string) {
            const limits = RideJS.contractLimits;
            let info = {
                stdLibVersion: 3,
                type: 'account',
                maxSize: limits.MaxExprSizeInBytes,
                maxComplexity: limits.MaxComplexityByVersion(3),
                maxAccountVerifierComplexity: 0,
                compilation: {error: 'default error'},
                size: 0,
                complexity: 0,
                complexityByFunc: {},
                contentType: 0,
                scriptType: 0
            };
            try {
                const scriptInfo = RideJS.scriptInfo(content);
                if ('error' in scriptInfo) throw 'invalid scriptInfo';
                const {stdLibVersion, contentType, scriptType} = scriptInfo;
                info.compilation = RideJS.compile(content);
                info.stdLibVersion = stdLibVersion;
                info.maxComplexity = limits.MaxComplexityByVersion(stdLibVersion);
                info.contentType = contentType;
                info.scriptType = scriptType;
                switch (contentType) {
                    case 2:
                        info.type = 'dApp';
                        info.maxAccountVerifierComplexity = limits.MaxAccountVerifierComplexityByVersion(stdLibVersion);
                        break;
                    case 3:
                        info.type = 'library';
                        break;
                    default:
                        info.type = scriptType === 2 ? 'asset' : 'account';
                        break;
                }
                const compilation = (info.compilation as any);

                info.maxSize = contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
                info.maxComplexity = limits.MaxComplexityByVersion(stdLibVersion);
                info.size = 'result' in compilation ? compilation.result.size : 0;
                info.size = 'result' in compilation ? compilation.result.size || compilation.size : 0;
                info.complexity = 'result' in compilation ? compilation.result.complexity || compilation.complexity : 0;
                info.complexityByFunc = 'result' in compilation ? compilation.result.complexityByFunc || {} : {};

            } catch (e) {

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
                        result = languageService.validateTextDocument(textDocument);
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
                        result = compileRideFile(data.content);
                        break;
                }
            } catch (e) {
                console.error(e);
                console.log({data, msgId, type});
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
