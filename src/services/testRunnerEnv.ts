import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as envFuncs from '@waves/js-test-env';
chai.use(chaiAsPromised);

export const injectTestEnvironment = (iframeWindow: any) => {
    iframeWindow.env = {};

    iframeWindow.expect = chai.expect;

    iframeWindow.compileTest = (test: string) => {
        iframeWindow.eval(test);
        return iframeWindow.mocha;
    };

    iframeWindow.global = iframeWindow;
    // add all env functions
    Object.entries(envFuncs).forEach(([name, val]) => iframeWindow[name] = val);
    (envFuncs as any).context = iframeWindow;
};