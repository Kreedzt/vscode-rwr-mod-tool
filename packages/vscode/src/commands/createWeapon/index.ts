import * as vscode from 'vscode';
import { parseXML } from '../../utils/parse';
import { IAllWeaponsRegisterXML, IWeaponRegisterXML } from './types';
import { buildXML } from '../../utils/build';
import { TemplateService } from './template';
import { getAllWeaponsUri } from './utils';

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
        },
    });

    vscode.window.showInformationMessage(`Get input: ${inputVal}!`);

    vscode.window.showInformationMessage(
        `Get workspace folders: ${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath}`,
    );
    return inputVal;
};

const getAllWeaponsRegistryNames = async (): Promise<string[]> => {
    const filePath = await getAllWeaponsUri();
    if (!filePath) {
        return [];
    }

    const fileContent = (
        await vscode.workspace.fs.readFile(filePath)
    ).toString();

    const xml = parseXML(fileContent) as IAllWeaponsRegisterXML;

    // Parse all_weapons.xml data
    const weaponNames: string[] = [];

    xml.weapons.weapon.forEach((weapon) => {
        weaponNames.push(weapon['@_file']);
    });

    return weaponNames;
};

const updateWeaponRegistry = async (
    inputWeaponName: string,
    weaponNames: string[],
): Promise<boolean> => {
    // Select all_weapons.xml data
    const select = await vscode.window.showQuickPick(weaponNames);
    console.log('user select', select);

    if (!select) {
        return false;
    }

    // TODO: not in weapons as error
    // const uris = await vscode.workspace.findFiles(`**/weapons/${select}`);
    const uris = await vscode.workspace.findFiles(`**/${select}`);
    console.log('updateWeaponRegistry: uris', uris);
    const groupFileName = uris[0];
    if (!groupFileName) {
        return false;
    }

    const groupFileContent = (
        await vscode.workspace.fs.readFile(groupFileName)
    ).toString();
    const groupFileXml = parseXML(groupFileContent) as IAllWeaponsRegisterXML;
    console.log(groupFileXml);
    const newWeaponList = [
        ...groupFileXml.weapons.weapon,
        {
            '@_file': `${inputWeaponName}.weapon`,
        } as IWeaponRegisterXML,
    ];
    groupFileXml.weapons.weapon = newWeaponList;

    const newGroupFileXmlContent = buildXML(groupFileXml);
    console.log(newGroupFileXmlContent);

    await vscode.workspace.fs.writeFile(
        groupFileName,
        Buffer.from(newGroupFileXmlContent),
    );
    return true;
};

const createWeaponFile = async (weaponName: string) => {
    const targetUri = await getAllWeaponsUri();
    if (!targetUri) {
        return;
    }

    const writePath = vscode.Uri.joinPath(
        vscode.Uri.joinPath(targetUri, '../'),
        `${weaponName}.weapon`,
    );
    console.log('createWeaponFile:writePath', writePath);

    const xmlContent = TemplateService.getCls().getXMLContent({ weaponName });

    if (!xmlContent) {
        return;
    }

    await vscode.workspace.fs.writeFile(writePath, Buffer.from(xmlContent));

    const textDocument = await vscode.workspace.openTextDocument(writePath);
    await vscode.window.showTextDocument(textDocument, {
        preview: true,
    });
};

export const registerWeaponCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-rwr-mod-tool.createWeapon',
            async () => {
                const inputWeaponName = await showNameInput();
                if (!inputWeaponName) {
                    return;
                }
                const weaponNames = await getAllWeaponsRegistryNames();
                if (
                    !(await updateWeaponRegistry(inputWeaponName, weaponNames))
                ) {
                    return;
                }
                await createWeaponFile(inputWeaponName);
            },
        ),
    );
};
