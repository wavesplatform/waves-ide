import { testRunner } from '@services';
import { Parser } from 'acorn';
import { IRange } from 'monaco-editor';

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

function getCoordinatesByPosition(content: string, pos: number): IRange | undefined {
    const split = content.split('\n');
    let symbols = 0, result: IRange | undefined = undefined;
    for (let i = 0; i < split.length; i++) {
        if (symbols <= pos && (symbols + split[i].length) >= pos) {
            let col = split[i].includes('describe') ? split[i].indexOf('describe') : split[i].indexOf('it');
            result = (col !== -1)
                ? ({startLineNumber: i + 1, startColumn: col + 2, endLineNumber: i + 1, endColumn: col + 3})
                : undefined;
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
    range: IRange,
}

function parse(content: string) {

    const parsedFile: any = Parser.parse(content), result: IParsedData[] = [];

    function fillResult({body}: any, titlePrefix = '') {
        body
            .filter(({type}: any) => type === 'ExpressionStatement')
            .map(({expression}: any) => expression)
            .filter(({type, callee}: any) =>
                type === 'CallExpression' && callee && ['it', 'describe'].includes(callee.name))
            .forEach(({arguments: args, start, callee: {name}}: any): any => {
                    const
                        fullTitle = `${titlePrefix}${args[0].value}`,
                        type = name === 'it' ? 'test' : 'suite',
                        range = getCoordinatesByPosition(content, start),
                        arg1 = args[1];
                    console.log(range)
                    arg1 && arg1.body && arg1.body.type === 'BlockStatement' &&
                    fillResult(arg1.body, `${fullTitle} `);

                    range && result.push({fullTitle, type, range});
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
