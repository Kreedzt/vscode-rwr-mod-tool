import * as vscode from 'vscode';
import { findFileRecursively, findFolderRecursively } from '../../utils/find';
import { parseXML } from '../../utils/parse';
import { IAllWeaponsRegisterXML, IWeaponRegisterXML } from './types';
import { buildXML } from '../../utils/build';
import { TemplateService } from './template';


const showNameInput = async () => {
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
	return inputVal;
}

const getAllWeaponsRegistryNames = async (): Promise<string[]> => {
	const res = await findFileRecursively('all_weapons.xml');

	res.forEach(target => {
		console.log(target);
	});

	const filePath = vscode.Uri.joinPath(res[0][0], 'all_weapons.xml');

	console.log('file path', filePath);

	const fileContent = (await vscode.workspace.fs.readFile(filePath)).toString();

	console.log('file content', fileContent);
	const xml = parseXML(fileContent) as IAllWeaponsRegisterXML;
	console.log(xml);

	// Parse all_weapons.xml data
	const weaponNames: string[] = [];

	xml.weapons.weapon.forEach(weapon => {
		weaponNames.push(weapon['@_file']);
	});

	return weaponNames;
}

const updateWeaponRegistry = async (inputWeaponName: string,weaponNames: string[]) => {
	// Select all_weapons.xml data
	const select = await vscode.window.showQuickPick(weaponNames);
	console.log('user select', select);

	if (!select) {
		return;
	}

	const userSelectFile = await findFileRecursively(select);
	if (!userSelectFile[0]) {
		return;
	}

	const groupFileName = vscode.Uri.joinPath(userSelectFile[0][0], userSelectFile[0][1]);

	const groupFileContent = (await vscode.workspace.fs.readFile(groupFileName)).toString();
	const groupFileXml = parseXML(groupFileContent) as IAllWeaponsRegisterXML;
	console.log(groupFileXml);
	const newWeaponList = [...groupFileXml.weapons.weapon, {
		'@_file': `${inputWeaponName}.weapon`
	} as IWeaponRegisterXML];
	groupFileXml.weapons.weapon = newWeaponList;
	
	const newGroupFileXmlContent = buildXML(groupFileXml);
	console.log(newGroupFileXmlContent);

	await vscode.workspace.fs.writeFile(groupFileName, Buffer.from(newGroupFileXmlContent));
}

const createWeaponFile = async (weaponName: string) => {
	const folderList = await findFolderRecursively('weapons');
	console.log('folderList', folderList);

	if (!folderList[0]) {
		return;
	}

	const writePath = vscode.Uri.joinPath(folderList[0], `${weaponName}.weapon`);
	
	const xmlContent = TemplateService.getCls().getXMLContent({ weaponName });

	if (!xmlContent) {
		return;
	}

	await vscode.workspace.fs.writeFile(writePath, Buffer.from(xmlContent));

	const textDocument = await vscode.workspace.openTextDocument(writePath);
	await vscode.window.showTextDocument(textDocument, {
		preview: true
	});
}

export const registerWeaponCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(vscode.commands.registerCommand('vscode-rwr-mod-tool.createWeapon', async () => {
		const inputWeaponName = await showNameInput();
		if (!inputWeaponName) {
			return;
		}
		const weaponNames = await getAllWeaponsRegistryNames();
		await updateWeaponRegistry(inputWeaponName, weaponNames);
		await createWeaponFile(inputWeaponName);
	}));
}