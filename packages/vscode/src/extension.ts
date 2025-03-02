// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerCommandList } from './commands';
import { disposeEventList, registerEventList } from './events';
import { registerLSP } from './lsp';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode" is now active!');
    registerCommandList(context);
    registerEventList(context);
    registerLSP(context);
}

// This method is called when your extension is deactivated
export function deactivate() {
    disposeEventList();
}
