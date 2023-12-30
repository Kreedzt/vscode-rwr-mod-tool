import * as vscode from 'vscode';

export const registerArmorCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-rwr-mod-tool.createArmor',
            () => {
                // The code you place here will be executed every time your command is executed
                // Display a message box to the user
                vscode.window.showInformationMessage(
                    'Create Weapon from rwr-mod-tool!',
                );
            },
        ),
    );
};
