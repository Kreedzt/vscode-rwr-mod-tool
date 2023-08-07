import * as vscode from 'vscode';

export const registerWeaponCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(vscode.commands.registerCommand('vscode-rwr-mod-tool.createWeapon', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Create Weapon from rwr-mod-tool!');
		const inputVal = await vscode.window.showInputBox({
			title: 'Weapon name',
			placeHolder: 'Enter your weapon name, do not input .xml suffix',
			validateInput: (val) => {
				if (val.trim().length === 0) {
					return 'Please input weapon name';
				}

				return '';
			}
		});

		vscode.window.showInformationMessage(`Get input: ${inputVal}!`);
		vscode.window.showInformationMessage(`Get workspace folders: ${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath}`);
	}));
}