import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as envFuncs from '@waves/js-test-env';
import { TSuite } from '@services/testRunner';

chai.use(chaiAsPromised);

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

    iframeWindow.expect = chai.expect;

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
    // add all env functions
    Object.entries(envFuncs).forEach(([name, val]) => iframeWindow[name] = val);
    (envFuncs as any).context = iframeWindow;
};