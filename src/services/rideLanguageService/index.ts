import { LspService } from '@waves/ride-language-server/LspService';
import monaco, { CancellationToken } from 'monaco-editor/esm/vs/editor/editor.api';
import ITextModel = monaco.editor.ITextModel;
import IMarkerData = monaco.editor.IMarkerData;
import CompletionList = monaco.languages.CompletionList;
import Hover = monaco.languages.Hover;
import SignatureHelp = monaco.languages.SignatureHelp;
import SignatureHelpResult = monaco.languages.SignatureHelpResult;
import LocationLink = monaco.languages.LocationLink;
import ProviderResult = monaco.languages.ProviderResult;
import Definition = monaco.languages.Definition;
import { TextDocument, Range } from 'vscode-languageserver-types';

export class MonacoLspServiceAdapter {

    validateTextDocument(model: ITextModel): IMarkerData[] {
        const document = TextDocument.create(model.uri.toString(), model.getModeId(), 1, model.getValue());
        const errors = this.languageService.validateTextDocument(document).map(diagnostic => ({
            message: diagnostic.message,
            startLineNumber: diagnostic.range.start.line + 1,
            startColumn: diagnostic.range.start.character + 1,
            endLineNumber: diagnostic.range.end.line + 1,
            endColumn: diagnostic.range.end.character + 1,
            code: diagnostic.code ? diagnostic.code.toString() : undefined,
            severity: monaco.MarkerSeverity.Error
        }));
        return errors;
    }

    completion(model: ITextModel, position: monaco.Position): CompletionList {
        const {textDocument, convertedPosition} = getTextAndPosition(model, position);
        const completionList = this.languageService.completion(textDocument, convertedPosition);

        return {
            suggestions: completionList.items.map(item => (
                {
                    ...item,
                    kind: item.kind! - 1,
                    insertText: item.insertText || item.label,
                    insertTextRules: item.insertTextFormat === 2 ? 4 : undefined // paste as string or as snippet
                }
            )),
            incomplete: completionList.isIncomplete,
            dispose: () => {
            }
        } as CompletionList;
    }

    hover(model: ITextModel, position: monaco.Position): Hover {
        const {textDocument, convertedPosition} = getTextAndPosition(model, position);
        return {contents: this.languageService.hover(textDocument, convertedPosition).contents.map(v => ({value: v}))};
    }

    signatureHelp(model: ITextModel, position: monaco.Position): SignatureHelpResult {
        const {textDocument, convertedPosition} = getTextAndPosition(model, position);
        // ToDo: Correctly fix type instead of plain casting
        return {
            value: this.languageService.signatureHelp(textDocument, convertedPosition) as SignatureHelp,
            dispose: () => {
            }
        };
    }

    provideDefinition(model: ITextModel, position: monaco.Position, token: CancellationToken):
        ProviderResult<Definition | LocationLink[]> {
        const {textDocument, convertedPosition} = getTextAndPosition(model, position);
        let result = this.languageService.definition(textDocument, convertedPosition);
        if (!Array.isArray(result)) result = [result];
        return result.map(({range, uri}) => ({
            range: lspRangeToMonacoRange(range),
            uri: monaco.Uri.parse(uri)
        }));
    }

}

function getTextAndPosition(model: ITextModel, position: monaco.Position) {
    return {
        textDocument: TextDocument.create(model.uri.toString(), model.getModeId(), 1, model.getValue()),
        convertedPosition: {
            line: position.lineNumber - 1,
            character: position.column - 1
        }
    };
}

const lspRangeToMonacoRange = (range: Range): monaco.IRange => ({
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1
});

export default new MonacoLspServiceAdapter();



// import { ICompilationError, ICompilationResult } from '@waves/ride-js';
// import RideInfoCompilerWorker from './worker';
// import EventEmitter from 'wolfy87-eventemitter';
//
// export type TRideFileType = 'account' | 'asset' | 'dApp' | 'library';
//
// export interface IRideFileInfo {
//     readonly stdLibVersion: number,
//     readonly type: TRideFileType,
//     readonly maxSize: number,
//     readonly maxComplexity: number,
//     readonly compilation: ICompilationResult | ICompilationError,
//     readonly size: number,
//     readonly complexity: number
// }
//
// class RideInfoService extends EventEmitter {
//     id = 0;
//     worker: any;
//
//     constructor() {
//         super();
//         this.worker = new RideInfoCompilerWorker();
//         this.worker.addEventListener('message', (event: any) => {
//             this.emit('result' + event.data.msgId, event.data.info);
//         });
//     }
//
//     async provideInfo(content: string): Promise<IRideFileInfo> {
//         const msgId = ++this.id;
//         this.worker.postMessage({content, msgId});
//         return new Promise((resolve, reject) => {
//             this.once('result' + msgId, (info: IRideFileInfo) => {
//                 resolve(info)
//             });
//         });
//     }
//
// }
//
// export default new RideInfoService();
