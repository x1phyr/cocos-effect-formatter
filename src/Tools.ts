import * as vscode from 'vscode';

export class Tools {
    /**
     * 抽取 CCEffect 和 CCProgram
     * @param document 
     */
    static divideCCEffect(document: vscode.TextDocument): { effect: vscode.Range[], program: vscode.Range[] } {
        const effectStartReg = /CCEffect %{/;
        // const programStartReg = /CCProgram\s+(\w+)\s*%\{\s*/;
        const programStartReg = /CCProgram\s+.+\s*%\{\s*/;
        const endReg = /}%/;
        let flag = 0;
        let tempPos: vscode.Position | null = null;
        let text: string;
        let effect: vscode.Range[] = [], program: vscode.Range[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            text = document.lineAt(i).text;
            switch (flag) {
                case 0: // not match
                    if (effectStartReg.test(text)) {
                        // match effect
                        tempPos = new vscode.Position(i + 1, 0);
                        flag = 1;
                    } else if (programStartReg.test(text)) {
                        // match program
                        tempPos = new vscode.Position(i + 1, 0);
                        flag = 2;
                    }
                    break;
                case 1: // match effect
                    if (tempPos && endReg.test(text)) {
                        effect.push(new vscode.Range(tempPos, document.lineAt(i - 1).range.end));
                        flag = 0;
                    }
                    break;
                case 2: // match program
                    if (tempPos && endReg.test(text)) {
                        program.push(new vscode.Range(tempPos, document.lineAt(i - 1).range.end));
                        flag = 0;
                    }
                    break;
            }
        }
        return { effect, program };
    }
}