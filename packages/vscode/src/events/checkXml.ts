import * as vscode from "vscode";
import { parseXML } from "../utils/parse";
import { TaskService } from "../services/task";
import { checkRefFileExists } from "../utils/xmlFileValidator";
import { FileResResolver } from "./fileResResolver";

export const scanFile = async (e: vscode.Uri) => {
    const file = await vscode.workspace.fs.readFile(e);
    const fileContent = file.toString();
    const xmlStruct = parseXML(fileContent);

    const checkRes = await checkRefFileExists(e, fileContent, xmlStruct);

    if (!checkRes.result) {
        checkRes.properties.forEach((p) => {
            if (!p.result) {
                console.log(`Resource not found: :${p.file}`);
            }
        });
    }
};

export const startXmlCheckTask = async () => {
    console.log("startXmlCheck");

    if (!TaskService.self().getReady()) {
        return;
    }

    return new Promise<void>((resolve) => {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Window,
                cancellable: false,
                title: "RWR Mod Tool: Scanning file...",
            },
            async (progress) => {
                progress.report({ increment: 0 });
                // clear warning
                FileResResolver.self().clear();

                // Combined glob pattern for all file types
                const allUri = await vscode.workspace.findFiles(
                    "**/{calls/*.xml,calls/*.call,factions/*.models,factions/*.xml,items/*.carry_item,items/*.base,weapons/*.weapon,weapons/*.xml}",
                );

                console.log("allUri", allUri);

                const totalFiles = allUri.length;
                let processed = 0;
                const progressIncrement = 5;

                await Promise.all(
                    allUri.map(async (f) => {
                        await scanFile(f);

                        processed++;
                        if (processed % progressIncrement === 0 || processed === totalFiles) {
                            const progressPercent = (processed / totalFiles) * 100;
                            progress.report({
                                increment: (progressIncrement / totalFiles) * 100,
                                message: `${progressPercent.toFixed()}% (${processed}/${totalFiles})`,
                            });
                        }
                    }),
                );

                resolve();
            },
        );
    });
};
