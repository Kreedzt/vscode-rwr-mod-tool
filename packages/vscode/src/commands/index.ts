import * as vscode from 'vscode';
import { registerWeaponCommand } from './createWeapon';
import { registerArmorCommand } from './createArmor';
import { registerFormatActiveFileCommand } from './formatActiveFile';
import { registerFormatWorkspaceCommand } from './formatWorkspace';
import { registerShowFileFormatOutputCommand } from './showFileFormatOutput';

export function registerCommandList(context: vscode.ExtensionContext) {
    console.log('registerCommandList');
    registerWeaponCommand(context);
    registerArmorCommand(context);
    registerFormatActiveFileCommand(context);
    registerFormatWorkspaceCommand(context);
    registerShowFileFormatOutputCommand(context);
}
