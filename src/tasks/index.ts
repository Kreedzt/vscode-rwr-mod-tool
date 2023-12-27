import * as vscode from 'vscode';
import { startXmlCheck } from './checkXml';

export const registerTaskList = async (context: vscode.ExtensionContext) => {
    console.log('registerTaskList...');

    startXmlCheck();
    
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(e => {
            startXmlCheck();
        }),
        vscode.workspace.onDidCreateFiles(e => {
            startXmlCheck();
        }),
        vscode.workspace.onDidDeleteFiles(e => {
            startXmlCheck();
        }),
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            startXmlCheck();
        }),
        vscode.window.onDidChangeActiveTextEditor(e => {
            startXmlCheck();
        })
    )
}