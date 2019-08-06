import { addEnvFunctionsToGlobal } from '@waves/js-test-env';
import { TSuite } from '@services/TestRunner';
import bindKeeper from '@utils/bindKeeper';

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
