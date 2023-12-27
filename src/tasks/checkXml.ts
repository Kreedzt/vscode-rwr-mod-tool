import * as vscode from "vscode";

export const scanFile = async (e: vscode.Uri) => {
    const file = await vscode.workspace.fs.readFile(e);
    const fileContent = file.toString();
    console.log('fileContent', fileContent);
}

export const startXmlCheck = async () => {
    console.log('startXmlCheck');
    const [calls, factions, items, weapons] = await Promise.all([
        vscode.workspace.findFiles('**/calls/*.{xml,call}'),
        vscode.workspace.findFiles('**/factions/*.{models,xml}'),
        vscode.workspace.findFiles('**/items/*.{carry_item,base}'),
        vscode.workspace.findFiles('**/weapons/*.{weapon,xml}'),
    ]);

    const allUri = [...calls, ...factions, ...items, ...weapons];
    console.log('allUrl', allUri);
    await Promise.all(allUri.map(scanFile));
}