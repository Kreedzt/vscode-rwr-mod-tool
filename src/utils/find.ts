import * as vscode from 'vscode';

async function loopDirectoryFiles(directory: vscode.Uri, callback: (folderUri: vscode.Uri, fileName: string) => void) {
    let currentDirLoop: vscode.Uri[] = [directory];

    while (currentDirLoop.length > 0) {
        const nextDirLoop: vscode.Uri[] = [];
        await Promise.all(currentDirLoop.map(async (dir) => {
            const dirInfoArr = await vscode.workspace.fs.readDirectory(dir);

            await Promise.all(dirInfoArr.map(async (dirInfo) => {
                switch (dirInfo[1]) {
                    case vscode.FileType.Directory:
                        nextDirLoop.push(vscode.Uri.joinPath(dir, dirInfo[0]));
                        break;
                    case vscode.FileType.File:
                        callback(dir, dirInfo[0]);
                        break;
                    default:
                        break;
                }
            }));
        }));

        currentDirLoop = nextDirLoop;
    }
}

async function loopDirectory(directory: vscode.Uri, callback: (folderUri: vscode.Uri) => void) {
    let currentDirLoop: vscode.Uri[] = [directory];

    while (currentDirLoop.length > 0) {
        const nextDirLoop: vscode.Uri[] = [];
        await Promise.all(currentDirLoop.map(async (dir) => {
            const dirInfoArr = await vscode.workspace.fs.readDirectory(dir);

            callback(dir);

            await Promise.all(dirInfoArr.map(async (dirInfo) => {
                switch (dirInfo[1]) {
                    case vscode.FileType.Directory:
                        nextDirLoop.push(vscode.Uri.joinPath(dir, dirInfo[0]));
                        break;
                    default:
                        break;
                }
            }));
        }));

        currentDirLoop = nextDirLoop;
    }
}

export const findFileRecursively = async (fileName: string): Promise<[vscode.Uri, string][]> => {
    const res: [vscode.Uri, string][] = [];

    const workSpacePath = vscode.workspace.workspaceFolders?.[0]?.uri;

    if (!workSpacePath) {
        return res;
    }



    await loopDirectoryFiles(workSpacePath, (loopFolderUri, loopFileName) => {
        if (loopFileName === fileName) {
            res.push([loopFolderUri, loopFileName]);
        }
    });

    return res;
}

export const findFolderRecursively = async (folderName: string): Promise<vscode.Uri[]> => {
    const res: vscode.Uri[] = [];

    const workSpacePath = vscode.workspace.workspaceFolders?.[0]?.uri;

    if (!workSpacePath) {
        return res;
    }


    await loopDirectory(workSpacePath, (loopFolderUri) => {
        if (loopFolderUri.fsPath.endsWith(folderName)) {
            res.push(loopFolderUri);
        }
    });

    return res;
}