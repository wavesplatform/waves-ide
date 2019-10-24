import compiler from "@waves/ride-js";

export default (origin) => (() => {
    self.importScripts([`${origin}/vendor/@waves/ride-js/dist/ride.min.js`]);
    self.addEventListener("message", e => {
        if (!e) return;
        const {content} = e.data;
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
            const limits = self.RideJS.compiler.contractLimits;
            const scriptInfo = self.RideJS.compiler.scriptInfo(content);
            if ('error' in scriptInfo) throw 'invalid scriptInfo';
            info.compilation = compiler.compile(content);
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
            info.size = 'result' in info.compilation ? info.compilation.result.size : 0;
            info.complexity = 'result' in info.compilation ? info.compilation.result.complexity : 0;
            postMessage(info);
        } catch (e) {
            console.error(e);
        }


    });
});
