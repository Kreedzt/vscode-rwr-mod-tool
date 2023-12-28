import * as vscode from 'vscode';
import { startXmlCheck } from './checkXml';

export const registerTaskList = async (context: vscode.ExtensionContext) => {
    console.log('registerTaskList...');

    startXmlCheck();
    
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(e => {
            console.log('onDidSaveTextDocument: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidCreateFiles(e => {
            console.log('onDidCreateFiles: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidDeleteFiles(e => {
            console.log('onDidDeleteFiles: startXmlCheck');
            startXmlCheck();
        }),
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            console.log('onDidChangeWorkspaceFolders: startXmlCheck');
            startXmlCheck();
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            console.log('onDidChangeActiveTextEditor: startXmlCheck');
            startXmlCheck();
        })
    )
}