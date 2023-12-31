import * as vscode from 'vscode';
import { checkXmlFormatted, formatXml } from '../../utils/file';
import { TaskService } from '../../services/task';
import { ThreadTask } from '../../services/threadTask';

const formatWorkspace = async () => {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'RWR Mod Tool: Formatting workspace...',
        cancellable: false,
    }, async (progress, token) => {
        TaskService.self().pause();

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
    });
};

export const registerFormatWorkspaceCommand = async (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-rwr-mod-tool.formatWorkspace', formatWorkspace)
    );
};