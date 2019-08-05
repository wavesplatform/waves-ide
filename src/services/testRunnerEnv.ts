import { addEnvFunctionsToGlobal } from '@waves/js-test-env';
import { TSuite } from '@services/TestRunner';

const convert = (x: TSuite): any => {
    return {
        title: x.title,
        fullTitle: x.fullTitle(),
        tests: x.tests.map(x => ({title: x.title, fullTitle: x.fullTitle()})),
        suites: x.suites.map(x => convert(x))
    };
};

export const injectTestEnvironment = (iframeWindow: any) => {
    iframeWindow.env = {};

    addEnvFunctionsToGlobal(iframeWindow);

    Object.defineProperty(iframeWindow, 'WavesKeeper', {
        get: () => {
            const keeper = WavesKeeper;
            if (keeper == null) {
                throw new Error('WavesKeeper API not available. Make sure you have WavesKeeper installed');
            }
            return keeper;
        }
    });

    iframeWindow.compileTest = (test: string) => {
        try {
            iframeWindow.eval(test);
            return {
                result: convert(iframeWindow.mocha.suite)
            };
        } catch (e) {
            return {
                error: e.message
            };
        }
    };

    iframeWindow.global = iframeWindow;
};
