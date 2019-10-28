const worker = (origin: string) => (() => {
    (self as any).importScripts([`${origin}/vendor/@waves/ride-js/dist/ride.min.js`]);
    self.addEventListener('message', e => {
        if (!e) return;
        const {content, msgId} = e.data;
        const limits = (self as any).RideJS.contractLimits;
        let info = {
            stdLibVersion: 2,
            type: 'account',
            maxSize: limits.MaxExprSizeInBytes,
            maxComplexity: limits.MaxComplexityByVersion(2),
            compilation: {error: 'default error'},
            size: 0,
            complexity: 0
        };
        try {
            const scriptInfo = (self as any).RideJS.scriptInfo(content);
            if ('error' in scriptInfo) throw 'invalid scriptInfo';
            info.compilation = (self as any).RideJS.compile(content);
            info.stdLibVersion = scriptInfo.stdLibVersion;
            switch (scriptInfo.contentType) {
                case 2:
                    info.type = 'dApp';
                    break;
                case 3:
                    info.type = 'library';
                    break;
                default:
                    info.type = scriptInfo.scriptType === 2 ? 'asset' : 'account';
                    break;
            }
            info.maxSize = scriptInfo.contentType === 2 ? limits.MaxContractSizeInBytes : limits.MaxExprSizeInBytes;
            info.maxComplexity = limits.MaxComplexityByVersion(scriptInfo.stdLibVersion);
            info.size = 'result' in info.compilation ? (info.compilation as any).result.size : 0;
            info.complexity = 'result' in info.compilation ? (info.compilation as any).result.complexity : 0;
            postMessage({info, msgId}, undefined as any);
        } catch (e) {
            console.error(e);
        }
    });
});

export default class RideInfoCompilerWorker {
    constructor() {
        const code = worker(window.location.origin).toString();
        const blob = new Blob(['(' + code + ')()']);
        return new Worker(URL.createObjectURL(blob));
    }
}
