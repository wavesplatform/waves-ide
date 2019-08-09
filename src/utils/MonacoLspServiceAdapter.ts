import { LspService } from '@waves/ride-language-server/LspService';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ITextModel = monaco.editor.ITextModel;
import IMarkerData = monaco.editor.IMarkerData;
import CompletionList = monaco.languages.CompletionList;
import Hover = monaco.languages.Hover;
import SignatureHelp = monaco.languages.SignatureHelp;
import { TextDocument } from 'vscode-languageserver-types';

export class MonacoLspServiceAdapter {
    constructor(private languageService: LspService){}

    validateTextDocument(model: ITextModel): IMarkerData[]{
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
        const { textDocument, convertedPosition } = getTextAndPosition(model, position);
        const completionList = this.languageService.completion(textDocument, convertedPosition);

        return {
            suggestions: completionList.items.map(item => (
                {...item,
                    kind: item.kind! - 1,
                    insertText: item.insertText || item.label,
                    insertTextRules: item.insertTextFormat === 2 ? 4 : undefined // paste as string or as snippet
                }
            )),
            incomplete: completionList.isIncomplete,
            dispose: () => {}
        } as CompletionList;
    }

    hover(model: ITextModel, position: monaco.Position): Hover {
        const { textDocument, convertedPosition } = getTextAndPosition(model, position);
        return {contents : this.languageService.hover(textDocument, convertedPosition).contents.map(v => ({value: v}))};
    }

    signatureHelp(model: ITextModel, position: monaco.Position): SignatureHelp {
        const { textDocument, convertedPosition } = getTextAndPosition(model, position);
        // ToDo: Correctly fix type instead of plain casting
        return this.languageService.signatureHelp(textDocument, convertedPosition) as SignatureHelp;
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
