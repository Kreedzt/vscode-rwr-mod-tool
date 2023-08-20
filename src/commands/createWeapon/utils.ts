import * as vscode from 'vscode';

export const getAllWeaponsUri = async (): Promise<undefined | vscode.Uri> => {
    const uris = await vscode.workspace.findFiles('**/weapons/all_weapons.xml');
	let targetUri: vscode.Uri | undefined = undefined;

	uris.forEach(u => {
		if (u.path.endsWith('/weapons/all_weapons.xml')) {
			targetUri = u;
		}
	});

    console.log('in getAllWeaponsFolderUri:');
    console.log(uris);

	return targetUri;
}