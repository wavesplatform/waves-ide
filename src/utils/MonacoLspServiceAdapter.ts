import {LspService} from "ride-language-server/out/LspService";
import * as monaco from "monaco-editor";
import ITextModel = monaco.editor.ITextModel;
import IMarkerData = monaco.editor.IMarkerData;
import CompletionList = monaco.languages.CompletionList;
import {Position, TextDocument} from "vscode-languageserver-types";

export class MonacoLspServiceAdapter {
    constructor(private languageService: LspService){}

    validateTextDocument(model: ITextModel): IMarkerData[]{
        const document = TextDocument.create(model.uri.toString(), model.getModeId(),1, model.getValue());
        const errors = this.languageService.validateTextDocument(document).map(diagnostic =>({
            message: diagnostic.message,
            startLineNumber: diagnostic.range.start.line + 1,
            startColumn: diagnostic.range.start.character + 1,
            endLineNumber: diagnostic.range.end.line + 1,
            endColumn: diagnostic.range.end.character + 1,
            code: diagnostic.code ? diagnostic.code.toString() : undefined,
            severity: monaco.MarkerSeverity.Error
        }));
        return errors
    }

    completion(model: ITextModel, position: monaco.Position): CompletionList {
        const textDocument =  TextDocument.create(model.uri.toString(),model.getModeId(),1, model.getValue());
        const convertedPosition: Position = {
            line: position.lineNumber - 1,
            character: position.column - 1
        };

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
            dispose: ()=>{}
        } as CompletionList
    }
}

