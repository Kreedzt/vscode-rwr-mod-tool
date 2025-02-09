import * as vscode from 'vscode';
import { startXmlCheckTask } from './checkXml';
import { FileScanner } from '../services/fileScanner';
import { XmlValidator } from '../services/xmlValidator';

let scanner: FileScanner | null = null;

export const registerEventList = async (context: vscode.ExtensionContext) => {
    console.log('registerEventList...');

    scanner = new FileScanner().addValidator(new XmlValidator());
    startXmlCheckTask().then(() => {
        scanner?.startScan();
    });

    context.subscriptions.push(
        vscode.workspace.onDidCreateFiles((e) => {
            console.log(
                'onDidCreateFiles: startXmlCheck',
                e.files.map((f) => f.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f);
            });
        }),
        vscode.workspace.onDidDeleteFiles((e) => {
            console.log(
                'onDidDeleteFiles: startXmlCheck',
                e.files.map((f) => f.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f);
            });
        }),
        vscode.workspace.onDidRenameFiles((e) => {
            console.log(
                'onDidRenameFiles: startXmlCheck',
                e.files.map((f) => f.oldUri.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f.oldUri);
            });
        }),
        vscode.workspace.onDidChangeTextDocument((e) => {
            console.log(
                'onDidChangeTextDocument: startXmlCheck',
                e.document.fileName,
            );
            scanner?.addScanFile(e.document.uri, e.document.getText());
        }),
    );
};

export const disposeEventList = () => {
    scanner?.destroy();
};
