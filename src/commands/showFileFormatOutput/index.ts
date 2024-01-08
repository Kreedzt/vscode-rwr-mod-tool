import * as vscode from 'vscode';
import { FileFormatOutputService } from '../../services/fileFormatOutput';

const showFileFormatOutput = () => {
    FileFormatOutputService.self().show();
};

export const registerShowFileFormatOutputCommand = async (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-rwr-mod-tool.showFileFormatOutput', showFileFormatOutput)
    );
};