import monaco, { CancellationToken } from 'monaco-editor/esm/vs/editor/editor.api';
import { Range } from 'vscode-languageserver-types';
import Worker from './worker';
import EventEmitter from 'wolfy87-eventemitter';
import { IFlattenedCompilationResult } from "@waves/ride-js";
import ITextModel = monaco.editor.ITextModel;
import IMarkerData = monaco.editor.IMarkerData;
import CompletionList = monaco.languages.CompletionList;
import Hover = monaco.languages.Hover;
import SignatureHelpResult = monaco.languages.SignatureHelpResult;
import Definition = monaco.languages.Definition;

export type TRideFileType = 'account' | 'asset' | 'dApp' | 'library';

export interface ICompilation {
    ast?: object
    base64?: string
    bytes?: Uint8Array
    size?: number
    complexity?: number
    verifierComplexity?: number
    callableComplexities?: Record<string, number>
    userFunctionComplexities?: Record<string, number>
    globalVariableComplexities?: Record<string, number>
    stateCallsComplexities?: Record<string, number>
    error?: string
}

export interface IRideFileInfo {
    readonly stdLibVersion: number,
    readonly type: TRideFileType,
    readonly maxSize: number,
    readonly maxComplexity: number,
    readonly compilation: ICompilation,
    readonly maxAccountVerifierComplexity: number,
    readonly scriptType: number
    readonly contentType: number
    // readonly maxstateCallsComplexities: number
}


export class RideLanguageService extends EventEmitter {
    id = 0;
    worker: any;

    constructor() {
        super();
        this.worker = new Worker();
        this.worker.addEventListener('message', (event: any) => {
            this.emit('result' + event.data.msgId, event.data.result);
        });
    }

    async validateTextDocument(model: ITextModel): Promise<IMarkerData[]> {
        const msgId = ++this.id;
        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getModeId(),
                content: model.getValue()
            },
            msgId,
            type: 'validateTextDocument'
        });

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (diagnosticArray: any) => {
                const errors = diagnosticArray.map((diagnostic: any) => ({
                    message: diagnostic.message,
                    startLineNumber: diagnostic.range.start.line + 1,
                    startColumn: diagnostic.range.start.character + 1,
                    endLineNumber: diagnostic.range.end.line + 1,
                    endColumn: diagnostic.range.end.character + 1,
                    code: diagnostic.code ? diagnostic.code.toString() : undefined,
                    severity: monaco.MarkerSeverity.Error
                }));

                resolve(errors);
            });
        });
    }

    async completion(model: ITextModel, {lineNumber, column}: monaco.Position): Promise<CompletionList> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getModeId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'completion'
        })

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (completionList: any) => {
                const result = {
                    suggestions: completionList.items.map((item: any) => (
                        {
                            ...item,
                            kind: item.kind! - 1,
                            insertText: item.insertText || item.label,
                            insertTextRules: item.insertTextFormat === 2 ? 4 : undefined
                            // paste as string or as snippet
                        }
                    )),
                    incomplete: completionList.isIncomplete,
                    dispose: () => {
                    }
                } as CompletionList;

                resolve(result);
            });
        });
    }

    async hover(model: ITextModel, {lineNumber, column}: monaco.Position): Promise<Hover> {
        const msgId = ++this.id;
        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getModeId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'hover'
        })

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (hoverResult: any) => {
                const result = {contents: hoverResult.contents.map((v: any) => ({value: v}))};
                resolve(result);
            });
        });
    }


    async signatureHelp(model: ITextModel, {lineNumber, column}: monaco.Position): Promise<SignatureHelpResult> {
        const msgId = ++this.id;
        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getModeId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'signatureHelp'
        })

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (value: any) => {
                const result = {
                    value,
                    dispose: () => {
                    }
                };
                resolve(result);
            });
        });

    }


    async provideDefinition(model: ITextModel, {lineNumber, column}: monaco.Position, token: CancellationToken): Promise<Definition> {
        const msgId = ++this.id;
        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getModeId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'definition'
        })

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (def: any) => {
                if (!Array.isArray(def)) def = [def];
                const result = def.map(({range, uri}: any) => ({
                    range: lspRangeToMonacoRange(range),
                    uri: monaco.Uri.parse(uri)
                }));
                resolve(result);
            });
        });

    }

    async provideInfo(content: string): Promise<IRideFileInfo> {
        const msgId = ++this.id;
        this.worker.postMessage({data: {content}, msgId, type: 'compile'});

        return new Promise((resolve, reject) => {
            this.once('result' + msgId, (info: IRideFileInfo) => {
                resolve(info);
            });
        });
    }

}


const lspRangeToMonacoRange = (range: Range): monaco.IRange => ({
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1
});

export default new RideLanguageService();
