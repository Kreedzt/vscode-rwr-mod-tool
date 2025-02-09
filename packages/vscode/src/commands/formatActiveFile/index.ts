import * as vscode from 'vscode';
import * as prettier from "prettier";
import { checkXmlFormatted, formatXml } from '../../utils/file';
import { FileFormatOutputService } from '../../services/fileFormatOutput';

const formatActiveFile = async () => {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
        return;
    }

    const text = activeTextEditor.document.getText();
    const uri = activeTextEditor.document.uri;

    FileFormatOutputService.self().clear();

    try {
        const isFormatted = await checkXmlFormatted(text);
        if (isFormatted) {
            return;
        }
        const formatted = await formatXml(text);
    
        await vscode.workspace.fs.writeFile(uri, Buffer.from(formatted));
    } catch (e: any) {
        FileFormatOutputService.self().appendError(e.toString());
        FileFormatOutputService.self().show();
        console.error(e);
    }
};

export const registerFormatActiveFileCommand = async (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-rwr-mod-tool.formatActiveFile', formatActiveFile)
    );
};