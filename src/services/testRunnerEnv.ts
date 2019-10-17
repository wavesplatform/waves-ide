import { addEnvFunctionsToGlobal } from '@waves/js-test-env';
import bindKeeper from '@utils/bindKeeper';
import { Suite } from 'mocha';

const convert = (x: Suite): any => {
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
