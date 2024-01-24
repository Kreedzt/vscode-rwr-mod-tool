import * as vscode from 'vscode';


export const registerOpenConfigCommand = async (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-rwr-mod-tool.openConfig', () => {
            vscode.commands.executeCommand('workbench.action.openSettings');
        })
    );
};