import * as vscode from 'vscode';
import { FileScanner } from '../services/fileScanner';
import { XmlValidator } from '../services/xmlValidator';

let scanner: FileScanner | null = null;

export const registerEventList = async (context: vscode.ExtensionContext) => {
    console.log('registerEventList...');

    scanner = new FileScanner().addValidator(new XmlValidator());

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'RWR Mod Tool: Scanning files...',
        },
        async (progress) => {
            // Scan all XML files in workspace
            const allUri = await vscode.workspace.findFiles(
                '**/{calls/*.xml,calls/*.call,factions/*.models,factions/*.xml,items/*.carry_item,items/*.base,weapons/*.weapon,weapons/*.xml}',
            );

            const totalFiles = allUri.length;

            if (totalFiles === 0) {
                progress.report({
                    increment: 100,
                    message: 'No XML files found to scan',
                });
                return;
            }

            let processed = 0;
            const increment = 100 / totalFiles;

            await Promise.all(
                allUri.map(async (uri) => {
                    try {
                        await scanner?.directValidateFile(uri);
                        processed += increment;
                        progress.report({
                            increment: increment,
                            message: `${processed.toFixed(2)}%`,
                        });
                    } catch (error) {
                        processed += increment;
                        console.error(
                            `Error validating file ${uri.fsPath}:`,
                            error,
                        );
                        // Continue with other files even if one fails
                    }
                }),
            );
        },
    );

    context.subscriptions.push(
        vscode.workspace.onDidCreateFiles((e) => {
            console.log(
                'onDidCreateFiles: scanning',
                e.files.map((f) => f.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f);
            });
        }),
        vscode.workspace.onDidDeleteFiles((e) => {
            console.log(
                'onDidDeleteFiles: scanning',
                e.files.map((f) => f.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f);
            });
        }),
        vscode.workspace.onDidRenameFiles((e) => {
            console.log(
                'onDidRenameFiles: scanning',
                e.files.map((f) => f.oldUri.fsPath),
            );
            e.files.forEach((f) => {
                scanner?.addScanFile(f.oldUri);
            });
        }),
        vscode.workspace.onDidChangeTextDocument((e) => {
            console.log(
                'onDidChangeTextDocument: scanning',
                e.document.fileName,
            );
            scanner?.addScanFile(e.document.uri, e.document.getText());
        }),
    );
};

export const disposeEventList = () => {
    scanner?.destroy();
};
