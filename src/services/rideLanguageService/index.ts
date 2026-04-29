import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { CancellationToken } from 'monaco-editor/esm/vs/editor/editor.api';
import { Range } from 'vscode-languageserver-types';
import RideInfoCompilerWorker from './worker';
import TypedEventEmitter from '@utils/TypedEventEmitter';

type ITextModel = monaco.editor.ITextModel;
type IMarkerData = monaco.editor.IMarkerData;
type CompletionList = monaco.languages.CompletionList;
type Hover = monaco.languages.Hover;
type SignatureHelpResult = monaco.languages.SignatureHelpResult;
type Definition = monaco.languages.Definition;

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
    readonly maxCallableComplexity: number,
    readonly compilation: ICompilation,
    readonly maxAccountVerifierComplexity: number,
    readonly imports: string[]
    readonly maxAssetVerifierComplexity: number,
    readonly scriptType: number,
    readonly contentType: number,
}

export class RideLanguageService extends TypedEventEmitter {
    private id = 0;
    private worker: Worker;  // 👈 ТИПИЗИРУЕМ КАК WORKER

    constructor() {
        super();
        this.worker = new RideInfoCompilerWorker() as Worker;  // 👈 ПРИВОДИМ К ТИПУ
        this.worker.addEventListener('message', (event: MessageEvent) => {
            this.emit(`result${event.data.msgId}`, event.data.result);
        });
    }

    async validateTextDocument(model: ITextModel, libraries: Record<string, string>): Promise<IMarkerData[]> {
        if (!model || (model as any).isDisposed?.()) {
            return [];
        }

        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getLanguageId(),
                content: model.getValue(),
                libraries
            },
            msgId,
            type: 'validateTextDocument'
        });

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve([]);
            }, 10000);

            this.once(`result${msgId}`, (diagnosticArray: any) => {
                clearTimeout(timeout);

                const errors = diagnosticArray.map((diagnostic: any) => ({
                    message: diagnostic.message,
                    startLineNumber: diagnostic.range.start.line + 1,
                    startColumn: diagnostic.range.start.character + 1,
                    endLineNumber: diagnostic.range.end.line + 1,
                    endColumn: diagnostic.range.end.character + 1,
                    code: diagnostic.code?.toString(),
                    severity: 8
                }));
                resolve(errors);
            });
        });
    }

    async completion(model: ITextModel, { lineNumber, column }: monaco.Position): Promise<CompletionList> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getLanguageId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'completion'
        });

        return new Promise((resolve) => {
            this.once(`result${msgId}`, (completionList: any) => {
                const result = {
                    suggestions: completionList.items.map((item: any) => ({
                        ...item,
                        kind: item.kind! - 1,
                        insertText: item.insertText || item.label,
                        insertTextRules: item.insertTextFormat === 2 ? 4 : undefined
                    })),
                    incomplete: completionList.isIncomplete,
                    dispose: () => {}
                };
                resolve(result);
            });
        });
    }

    async hover(model: ITextModel, { lineNumber, column }: monaco.Position): Promise<Hover> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getLanguageId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'hover'
        });

        return new Promise((resolve) => {
            this.once(`result${msgId}`, (hoverResult: any) => {
                resolve({ contents: hoverResult.contents.map((v: any) => ({ value: v })) });
            });
        });
    }

    async signatureHelp(model: ITextModel, { lineNumber, column }: monaco.Position): Promise<SignatureHelpResult> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getLanguageId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'signatureHelp'
        });

        return new Promise((resolve) => {
            this.once(`result${msgId}`, (value: any) => {
                resolve({ value, dispose: () => {} });
            });
        });
    }

    async provideDefinition(model: ITextModel, { lineNumber, column }: monaco.Position): Promise<Definition> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: {
                uri: model.uri.toString(),
                languageId: model.getLanguageId(),
                content: model.getValue(),
                lineNumber,
                column,
            },
            msgId,
            type: 'definition'
        });

        return new Promise((resolve) => {
            this.once(`result${msgId}`, (def: any) => {
                const result = (Array.isArray(def) ? def : [def]).map(({ range, uri }: any) => ({
                    range: lspRangeToMonacoRange(range),
                    uri: monaco.Uri.parse(uri)
                }));
                resolve(result);
            });
        });
    }

    async provideInfo(content: string, needCompaction?: boolean, removeUnused?: boolean, libraries?: Record<string, string>): Promise<IRideFileInfo> {
        const msgId = ++this.id;

        this.worker.postMessage({
            data: { content, needCompaction, removeUnused, libraries },
            msgId,
            type: 'compile'
        });

        return new Promise((resolve) => {
            this.once(`result${msgId}`, (info: IRideFileInfo) => {
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
