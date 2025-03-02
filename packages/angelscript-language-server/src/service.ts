import type {
    LanguageServicePlugin,
    LanguageServicePluginInstance,
    LocationLink,
} from '@volar/language-service';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';

function findFileInWorkspace(
    workspaceFolders: string[],
    includePath: string,
): string | undefined {
    for (const folder of workspaceFolders) {
        const foundPath = searchFileRecursive(folder, includePath);
        if (foundPath) {
            return foundPath;
        }
    }
    return undefined;
}

function searchFileRecursive(
    dir: string,
    targetFile: string,
): string | undefined {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const result = searchFileRecursive(fullPath, targetFile);
            if (result) return result;
        } else if (file === targetFile) {
            return fullPath;
        }
    }
    return undefined;
}

export const service: LanguageServicePlugin = {
    name: 'angelscript-service',
    capabilities: {
        hoverProvider: true,
        definitionProvider: true,
    },
    create(context): LanguageServicePluginInstance {
        console.log('angelscript-service created!');
        // Get workspace folders from context and convert to file paths
        const workspaceFolders = (context.env?.workspaceFolders || []).map(
            (folder) =>
                typeof folder === 'string'
                    ? URI.parse(folder).fsPath
                    : folder.fsPath,
        );
        return {
            // provideHover(document, position, token) {
            //     // Implement hover support here
            // },
            provideDefinition(document, position, token) {
                const line = position.line;

                // 获取整行
                const res = document.offsetAt(position);
                const wholeLine = document.getText().split('\n')[line];

                // 匹配 #include "" 语法
                const includeMatch = wholeLine.match(/#include\s+"(.+?)"/);
                if (includeMatch) {
                    const includePath = includeMatch[1];

                    const matchedFilePath = findFileInWorkspace(
                        workspaceFolders,
                        includePath,
                    );

                    if (matchedFilePath) {
                        // 创建目标文件的URI
                        const targetUri = URI.file(matchedFilePath).toString();

                        // 创建位置为第一行第一列的Range (0,0)
                        const targetPosition = {
                            line: 0,
                            character: 0,
                        };

                        const targetRange = {
                            start: targetPosition,
                            end: targetPosition,
                        };

                        return [
                            {
                                targetUri,
                                targetRange,
                                targetSelectionRange: targetRange,
                            },
                        ] as LocationLink[];
                    }

                    return [] as LocationLink[];
                }

                return [];
            },
            // TODO
        };
    },
};
