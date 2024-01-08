import * as vscode from 'vscode';

export class FileFormatOutputService {
    static inst: null | FileFormatOutputService = null;
    
    output: vscode.OutputChannel;

    constructor() {
        this.output = vscode.window.createOutputChannel('File Format Output');
    }

    static self() {
        if (!FileFormatOutputService.inst) {
            FileFormatOutputService.inst = new FileFormatOutputService();
        }

        return FileFormatOutputService.inst;
    }

    appendLine(value: string) {
        this.output.appendLine(`[INFO] ${value}`);
    }

    appendError(value: string) {
        this.output.appendLine(`[ERROR] ${value}`);
    }

    clear() {
        this.output.clear();
    }

    show() {
        this.output.show();
    }
}