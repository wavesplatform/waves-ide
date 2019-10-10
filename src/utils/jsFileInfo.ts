import { testRunner } from '@services';
import { Parser } from 'acorn';

export interface ICompilationResult {
    result: ISuite
}

export interface ITestMessage {
    message: any
    type: 'log' | 'error' | 'response'
}

export interface ITest {
    fullTitle: string
    title: string
}

export interface ISuite extends ITest {
    suites: ISuite[]
    tests: ITest[]
}

export interface ICompilationError {
    error: string
}

export interface IJSFileInfo {
    readonly compilation: ICompilationResult | ICompilationError,
    readonly parsingResult: IParsedData[],
}

export default async function getJSFileInfo(content: string): Promise<IJSFileInfo> {
    const compilation = await testRunner.compileTest(content);
    return {compilation, parsingResult: parse(content)};
}

function getRowByBos(content: string, pos: number): number | undefined {
    const split = content.split('\n');
    let symbols = 0, result;
    for (let i = 0; i < split.length; i++) {
        if (symbols <= pos && (symbols + split[i].length) >= pos) {
            result = i;
            break;
        } else {
            symbols += split[i].length;
        }
    }
    return result;
}

export interface IParsedData {
    fullTitle: string,
    type: 'test' | 'suite',
    row: number,
}

function parse(content: string) {

    const parsedFile: any = Parser.parse(content), result: IParsedData[] = [];

    function fillResult({body}: any, titlePrefix = '') {
        body
            .filter(({type}: any) => type === 'ExpressionStatement')
            .map(({expression}: any) => expression)
            .filter(({type, callee}: any) =>
                type === 'CallExpression' && callee && ['it', 'describe'].includes(callee.name))
            .forEach((node: any): any => {
                    const
                        fullTitle = `${titlePrefix}${node.arguments[0].value}`,
                        type = node.callee.name === 'it' ? 'test' : 'suite',
                        row = getRowByBos(content, node.start),
                        arg1 = node.arguments[1];

                    arg1 && arg1.body && arg1.body.type === 'BlockStatement' &&
                    fillResult(arg1.body, `${fullTitle} `);

                    row && result.push({fullTitle, type, row});
                }
            );
    }

    try {
        fillResult(parsedFile);
    } catch (e) {
        console.error('parsing error', e);
    }

    return result;
}
