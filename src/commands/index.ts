import * as vscode from 'vscode';
import { registerWeaponCommand } from './createWeapon';
import { registerArmorCommand } from './createArmor';


export function registerCommandList(context: vscode.ExtensionContext) {
    registerWeaponCommand(context);
    registerArmorCommand(context);
}