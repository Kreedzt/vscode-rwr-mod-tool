import * as vscode from 'vscode';

export class FileFormatOutputService {
    static inst: null | FileFormatOutputService = null;
    
    output: vscode.LogOutputChannel;

    constructor() {
        this.output = vscode.window.createOutputChannel('RWR Mod Tool: File Format Output', {
            log: true,
        });
    }

    static self() {
        if (!FileFormatOutputService.inst) {
            FileFormatOutputService.inst = new FileFormatOutputService();
        }

        return FileFormatOutputService.inst;
    }

    appendLine(value: string) {
        this.output.info(value);
    }

    appendError(value: string) {
        this.output.error(value);
    }

    clear() {
        this.output.clear();
    }

    show() {
        this.output.show();
    }
}