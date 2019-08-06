export default function bindKeeper (iframeWindow: any)  {
    Object.defineProperty(iframeWindow, 'WavesKeeper', {
        get: () => {
            const keeper = WavesKeeper;
            if (keeper == null) {
                throw new Error('WavesKeeper API not available. Make sure you have WavesKeeper installed');
            }
            return keeper;
        }
    });
}
