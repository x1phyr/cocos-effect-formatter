// reference: https://github.com/actarian/vscode-glsl-canvas/src/glsl/format.provider.ts

import * as vscode from 'vscode';

export default class GlslFormatProvider implements vscode.DocumentRangeFormattingEditProvider, vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const range = new vscode.Range(
            document.lineAt(0).range.start,
            document.lineAt(document.lineCount - 1).range.end
        );
        return this.provideDocumentRangeFormattingEdits(document, range, options, token);
    }

    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        let text = document.getText(range);
        const tab = options.insertSpaces ? new Array(options.tabSize).fill(' ').join('') : '\t';
        const comments = text.match(/(\/\/.*$)|(\/\*[\s\S]*\*\/)|#include\s*<.*>|#include\s*".*"|#include\s*'.*'/gm);
        const splitByComments = /\/\/.*$|\/\*[\s\S]*\*\/|#include\s*<.*>|#include\s*".*"|#include\s*'.*'/gm;
        const splitted = text.split(splitByComments).map(s => {
            // parentesis
            s = s.replace(/[^\S\n]*([\(\)\[\]])[^\S\n]*/g, '$1');
            // s = s.replace(/(?<!if|return)[^\S\n]*([\(\)\[\]])[^\S\n]*/g, '$1');
            // spaces
            s = s.replace(/([^\(\[])[^\S\n)]*([\*\+\-\/\=\>\<\!\?\:]+)[^\S\n)]*([^\+\-])/g, '$1 $2 $3');
            s = s.replace("define - meta", "define-mate");
            // s = s.replace(/([^\(\[])[^\S\n\()]*([\*\+\-\/\=/>/<]+)[^\S\n]*([^\+\-])/g, '$1 $2 $3');
            s = s.replace(/([\,\;])[^\S\n]*/g, '$1 ');
            s = s.replace(/[^\S\n]*([/{])/g, ' $1');
            // zero
            s = s.replace(/(\B)\.(\d)/g, '$10.$2');
            s = s.replace(/(\d)\.(\B)/g, '$1.0$2');
            // remove double spaces
            s = s.replace(/[^\S\n]+/gm, ' ');
            // special
            s = s.replace(/(if|return)[^\S\n]*([\(\[])/g, '$1 $2');
            // trim
            // s = s.replace(/^[^\S\n]+|[^\S\n]+$/gm, '');
            /*
            // remove start of line space
            s = s.replace(/^[^\S\n]+/gm, '');
            // remove end of line space
            s = s.replace(/[^\S\n]+$/gm, '');
            */
            // remove extra new line
            s = s.replace(/\n\s*\n\s*\n/g, '\n\n');
            // #pragma
            s = s.replace(/[^\S\r\n]*#pragma(.+?)\s*:\s*(\S+)[^\S\r\n]*/g, '#pragma$1:$2');
            return s;
        });
        text = '';
        while (splitted.length) {
            text += splitted.shift() + (comments ? (comments.shift() || '') : '');
        }
        // indent blocks
        let lines = text.split('\n');
        let i = 0;
        lines = lines.map(l => {
            if (/^\s*\/\//g.test(l)) {
                l = l.replace(/^\s*\/\//g, "//");
                if (i > 0) {
                    l = new Array(i).fill(tab).join('') + l;
                }
                return l;
            }
            l = l.trim();
            let a = (l.match(/^[^\{]*\}/g) || []).length;
            let b = (l.match(/^[^\(]*\)/g) || []).length;
            let c = (l.match(/^[^\[]*\]/g) || []).length;
            let d = (l.match(/#elif.*/g) || []).length;
            let e = (l.match(/#else.*/g) || []).length;
            let f = (l.match(/#endif.*/g) || []).length;
            i -= (a + b + c + d + e + f);
            if (i > 0) {
                l = new Array(i).fill(tab).join('') + l;
            }
            a = (l.match(/\{(?!.*\})/g) || []).length;
            b = (l.match(/\((?!.*\))/g) || []).length;
            c = (l.match(/\[(?!.*\])/g) || []).length;
            // macro
            d = (l.match(/#if.*/g) || []).length;
            e = (l.match(/#elif.*/g) || []).length;
            f = (l.match(/#else.*/g) || []).length;
            i += (a + b + c + d + e + f);
            return l;
        });
        const userCCProgramIndent = vscode.workspace.getConfiguration('cocosEffectFormatter').get('useCocosProgramIndent');
        if (userCCProgramIndent) {
            lines = lines.map(ele => ele == '' ? ele : (tab + ele));
        }
        text = lines.join('\n');
        return [vscode.TextEdit.replace(range, text)];
    }

}