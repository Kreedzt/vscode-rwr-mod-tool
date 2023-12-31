import * as vscode from 'vscode';
import { startXmlCheck } from './checkXml';

export const registerEventList = async (context: vscode.ExtensionContext) => {
    console.log('registerEventList...');

    startXmlCheck();

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((e) => {
            console.log('onDidSaveTextDocument: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidCreateFiles((e) => {
            console.log('onDidCreateFiles: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidDeleteFiles((e) => {
            console.log('onDidDeleteFiles: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidChangeWorkspaceFolders((e) => {
            console.log('onDidChangeWorkspaceFolders: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidRenameFiles((e) => {
            console.log('onDidRenameFiles: startXmlCheck');
            startXmlCheck();
        }),
    );
};
