import * as vscode from 'vscode';
import * as url from 'url';
import * as path from 'path';
import { checkXmlFormatted, formatXml } from '../../utils/file';
import { TaskService } from '../../services/task';
import { ThreadTask } from '../../services/threadTask';
import { WorkerResolver } from '../../services/workerResolver';
import { FileFormatOutputService } from '../../services/fileFormatOutput';

const formatWorkspace = async () => {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'RWR Mod Tool: Formatting workspace...',
        cancellable: false,
    }, async (progress, token) => {
        TaskService.self().pause();

        progress.report({ increment: 0 });

        console.time('formatWorkspace2');

        const uris = await vscode.workspace.findFiles('**/*.{xml,base,weapon,carry_item,models,call}');

        let progressCount = 0;
        const maxProgressCount = uris.length;

        const workerPath = url.pathToFileURL(path.join(__dirname, '../../workers/fileFormatWorker.js'));

        const resolver = new WorkerResolver(workerPath);

        const fileContents = await Promise.all(uris.map(async (uri) => {
            return (await vscode.workspace.fs.readFile(uri)).toString();
        }));

        console.log('fileContents length', fileContents.length);

        FileFormatOutputService.self().clear();

        let errorCount = 0;

        await Promise.all(fileContents.map(async (fileContent, index) => {
            try {
                console.log('Task started', index, fileContent.length);
                const formatted = await resolver.callWorkerMethod('formatXml', fileContent) as string;
                console.log('Task formatted', index, formatted.length);
                await vscode.workspace.fs.writeFile(uris[index], Buffer.from(formatted));
                console.log('Task completed', index);
            } catch (e: any) {
                errorCount++;
                FileFormatOutputService.self().appendError(`Task error: ${uris[index].path}`);
                FileFormatOutputService.self().appendError(e.toString());
                console.error('Task error', uris[index].path, e);
            }

            progressCount++;
            const progressVal = (progressCount / maxProgressCount) * 100;
            console.log('progress:', progressVal);
            progress.report({ increment: (1  / maxProgressCount) * 100, message: `${progressVal.toFixed()}%` });
        }));

        resolver.finish();

        progress.report({ increment: 100 });

        TaskService.self().resume();

        console.timeEnd('formatWorkspace2');

        if (errorCount > 0) {
            FileFormatOutputService.self().show();
        }
    });
};

const formatWorkspace_v1 = async () => {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'RWR Mod Tool: Formatting workspace...',
        cancellable: false,
    }, async (progress, token) => {
        TaskService.self().pause();

        console.time('formatWorkspace');

        progress.report({ increment: 0 });

        const uris = await vscode.workspace.findFiles('**/*.{xml,base,weapon,carry_item,models,call}');

        let progressCount = 0;
        const maxProgressCount = uris.length;

        const threads = new ThreadTask();

        uris.forEach(uri => {
            threads.addTask(async () => {
                try {
                    const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();

                    console.log('reading uri', uri);
    
                    const isFormatted = await checkXmlFormatted(fileContent);
                    if (!isFormatted) {
                        const formatted = await formatXml(fileContent);
                        await vscode.workspace.fs.writeFile(uri, Buffer.from(formatted));
                        console.log('write completed', uri);
                    } else {
                        console.log('already formatted', uri);
                    }
                } catch (e) {
                    console.error('Task error', uri, e);
                }

                progressCount++;
                const progressVal = (progressCount / maxProgressCount) * 100;
                progress.report({ increment: (1  / maxProgressCount) * 100, message: `${progressVal.toFixed()}%` });
            });
        });

        await threads.run();


        // single promise loop
        // while (progressCount !== maxProgressCount) {
        //     const uri = uris[progressCount];

        //     try {
        //         const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();
        //         console.log('reading uri', uri);
        //         const isFormatted = await checkXmlFormatted(fileContent);
        //         if (!isFormatted) {
        //             const formatted = await formatXml(fileContent);
        //             await vscode.workspace.fs.writeFile(uri, Buffer.from(formatted));
        //             console.log('write completed', uri);
        //         } else {
        //             console.log('already formatted', uri);
        //         }
        //     } catch (e) {
        //         console.error(e);
        //     }

        //     progressCount++;
        //     const progressVal = (progressCount / maxProgressCount) * 100;
        //     progress.report({ increment: 1  / maxProgressCount, message: `${progressVal.toFixed()}%` });
        // }

        // await Promise.all(uris.map(async (uri, index) => {
        //     try {
        //         const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();
        //         console.log('reading uri', uri);
        //         const formatted = await formatXml(fileContent);
    
        //         await vscode.workspace.fs.writeFile(uri, Buffer.from(formatted));
        //         console.log('write completed', uri);
        //         progressCount++;
        //         const progressVal = (progressCount / maxProgressCount) * 100;
        //         console.log('progress:', progressVal);
    
        //         progress.report({ increment: (progressCount / maxProgressCount) * 100, message: `processing...${progressVal}%` });
        //     } catch (e) {
        //         console.error(e);
        //     }
        // }));

        progress.report({ increment: 100 });

        TaskService.self().resume();

        console.timeEnd('formatWorkspace');
    });
};

export const registerFormatWorkspaceCommand = async (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-rwr-mod-tool.formatWorkspace', formatWorkspace)
    );
    // context.subscriptions.push(
    //     vscode.commands.registerCommand('vscode-rwr-mod-tool.formatWorkspace2', formatWorkspace2)
    // );
};