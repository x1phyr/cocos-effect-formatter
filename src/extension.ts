import * as vscode from 'vscode';
import GlslFormatProvider from './GlslFormatProvider';
import { YAMLFormatter } from './YamlFormatProvider';
import { Tools } from './Tools';


export function activate(context: vscode.ExtensionContext) {

	const GlslFormatProviderInst = new GlslFormatProvider();
	const YAMLFormatterInst = new YAMLFormatter();

	let disposable = vscode.languages.registerDocumentFormattingEditProvider('cocos-effect', {
		provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
			const { effect: effectRanges, program: programRanges } = Tools.divideCCEffect(document);
			let result: vscode.ProviderResult<vscode.TextEdit[]>[] = [];
			result.push(...effectRanges.map(r => {
				return YAMLFormatterInst.provideDocumentRangeFormattingEdits(document, r, options, token);
			}));
			result.push(...programRanges.map(r => {
				return GlslFormatProviderInst.provideDocumentRangeFormattingEdits(document, r, options, token);
			}));
			return Promise.all(result).then(v => {
				return v.reduce<vscode.TextEdit[]>((r, c) => {
					if (c) {
						r.push(...c);
					}
					return r;
				}, []);
			}, e => {
				console.error(e);
				return [];
			});
		}
	});

	context.subscriptions.push(disposable);
}

// export function deactivate() { }


