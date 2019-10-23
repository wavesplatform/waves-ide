import { Parser } from 'acorn';
import { IRange } from 'monaco-editor';

export interface ICompilationResult {
    result: ISuite
}

export interface ITest {
    identifierRange: IRange
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
    return parse(content);
}

export interface IParsedData {
    fullTitle: string,
    type: 'test' | 'suite',
    identifierRange: IRange,
}


function parse(content: string) {

    const resultTree: ISuite = {
        identifierRange: {startColumn: 0, startLineNumber: 0, endColumn: 0, endLineNumber: 0},
        fullTitle: '',
        title: '',
        suites: [],
        tests: []
    };


    try {
        const parsedFile: any = Parser.parse(content);
        fillResult(parsedFile);
        const flatResult = flattenSuitesAndTests(resultTree, true);
        const flatFullTitles = flatResult.map(({fullTitle}) => fullTitle);
        const duplicate = flatResult.find((v, i) => flatFullTitles.indexOf(v.fullTitle) !== i);
        if (duplicate) throw new Error(`Dublicate test name: ${duplicate.fullTitle}`);
        return {
            compilation: {
                result: resultTree,
            },
            parsingResult: flatResult
        };
    } catch (e) {
        return {
            compilation: {
                error: e.message
            },
            parsingResult: []
        };
    }

    function fillResult({body}: any, titlePrefix = '', current = resultTree) {
        body
            .filter(({type}: any) => type === 'ExpressionStatement')
            .map(({expression}: any) => expression)
            .filter(({type, callee}: any) =>
                type === 'CallExpression' && callee && ['it', 'describe'].includes(callee.name))
            .forEach(({arguments: args, callee: {name, end, start}}: any): any => {

                    const title = args[0].value;
                    const fullTitle = `${titlePrefix}${title}`;
                    const type = name === 'it' ? 'test' : 'suite';
                    let identifierRange = offsetsToRange(start + 1, end, content);
                    // set identifier column to next symbol. This fixes bug when we press enter right next to it
                    identifierRange.startColumn += 1;
                    const suiteBody = args[1];

                    let item: any = {
                        fullTitle,
                        title,
                        identifierRange
                    };

                    if (type === 'suite') {
                        item.suites = [];
                        item.tests = [];
                        current.suites.push(item);
                        if (suiteBody && suiteBody.body && suiteBody.body.type === 'BlockStatement') {
                            fillResult(suiteBody.body, `${fullTitle} `, item);
                        }
                    } else {
                        current.tests.push(item);
                    }
                }
            );
    }
}

const flattenSuitesAndTests = ({fullTitle, identifierRange, suites, tests}: ISuite, root = false): IParsedData[] => [
    ...(root ? [] : [{fullTitle, identifierRange, type: 'suite' as 'suite'}]), // exclude root suite
    ...tests.map(test => ({...test, type: 'test' as 'test'})),
    ...suites.reduce((acc, item) => [...acc, ...flattenSuitesAndTests(item)], [])
];

function offsetsToRange(startOffset: number, endOffset: number, content: string) {
    const offsetToRowCol = (offset: number) => {
        const sliced = content.slice(0, offset).split('\n');
        return {
            row: sliced.length,
            col: sliced[sliced.length - 1].length
        };
    };

    const {row: startLineNumber, col: startColumn} = offsetToRowCol(startOffset);
    const {row: endLineNumber, col: endColumn} = offsetToRowCol(endOffset);
    return {
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
    };
}
