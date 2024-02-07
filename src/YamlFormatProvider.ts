// reference: https://github.com/redhat-developer/yaml-language-server/src/languageservice/services/yamlFormatter.ts

import * as vscode from 'vscode';
import * as prettier from 'prettier';
import { Options } from 'prettier';
import * as parser from 'prettier/parser-yaml';

export class YAMLFormatter implements vscode.DocumentRangeFormattingEditProvider, vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const range = new vscode.Range(
            document.lineAt(0).range.start,
            document.lineAt(document.lineCount - 1).range.end
        );
        return this.provideDocumentRangeFormattingEdits(document, range, options, token);
    }

    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        try {
            const text = document.getText(range);
            const prettierOptions: Options = {
                parser: 'yaml',
                plugins: [parser],
                tabWidth: (options.tabWidth as number) || options.tabSize as number,
                proseWrap: 'always' === options.proseWrap ? 'always' : 'never' === options.proseWrap ? 'never' : 'preserve',
            };

            return prettier.format(text, prettierOptions).then(formatted => {
                return [vscode.TextEdit.replace(range, formatted)];
            });
        } catch (error) {
            return Promise.resolve([]);
        }
    }
}
