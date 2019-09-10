import { addEnvFunctionsToGlobal } from '@waves/js-test-env';
import bindKeeper from '@utils/bindKeeper';

const convert = (x: any): any => {
    return {
        title: x.title,
        fullTitle: x.fullTitle(),
        tests: x.tests.map((x: any) => ({title: x.title, fullTitle: x.fullTitle()})),
        suites: x.suites.map((x: any) => convert(x))
    };
};

export const injectTestEnvironment = (iframeWindow: any) => {
    iframeWindow.env = {};

    addEnvFunctionsToGlobal(iframeWindow);

    bindKeeper(iframeWindow);

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
