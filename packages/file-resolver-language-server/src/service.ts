import type {
    LanguageServicePlugin,
    LanguageServicePluginInstance,
    LocationLink,
} from '@volar/language-service';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';

const FILE_REF_ATTRIBUTES = ['file', 'file_name', 'filename', 'fileref'];

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
    name: 'file-resolver-service',
    capabilities: {
        hoverProvider: true,
        definitionProvider: true,
    },
    create(context): LanguageServicePluginInstance {
        console.log('file-resolver-service created!');
        const workspaceFolders = (context.env?.workspaceFolders || []).map(
            (folder) =>
                typeof folder === 'string'
                    ? URI.parse(folder).fsPath
                    : folder.fsPath,
        );
        return {
            provideDefinition(document, position, token) {
                const line = position.line;
                const wholeLine = document.getText().split('\n')[line];

                // Match file reference attributes
                for (const attr of FILE_REF_ATTRIBUTES) {
                    const attrRegex = new RegExp(`${attr}="([^"]+)"`, 'g');
                    const matches = [...wholeLine.matchAll(attrRegex)];

                    for (const match of matches) {
                        const filePath = match[1];
                        const attrStart = match.index || 0;
                        const filePathStart =
                            attrStart + match[0].indexOf(filePath);
                        const filePathEnd = filePathStart + filePath.length;

                        // Check if cursor position is within the file path
                        const cursorChar =
                            document.offsetAt(position) -
                            document.offsetAt({ line, character: 0 });
                        if (
                            cursorChar >= filePathStart &&
                            cursorChar <= filePathEnd
                        ) {
                            const matchedFilePath = findFileInWorkspace(
                                workspaceFolders,
                                filePath,
                            );

                            if (matchedFilePath) {
                                const targetUri =
                                    URI.file(matchedFilePath).toString();

                                // Calculate the exact range for the file path
                                const targetRange = {
                                    start: {
                                        line,
                                        character: filePathStart,
                                    },
                                    end: {
                                        line,
                                        character: filePathEnd,
                                    },
                                };

                                return [
                                    {
                                        targetUri,
                                        targetRange: {
                                            start: { line: 0, character: 0 },
                                            end: { line: 0, character: 0 },
                                        },
                                        targetSelectionRange: {
                                            start: { line: 0, character: 0 },
                                            end: { line: 0, character: 0 },
                                        },
                                        originSelectionRange: targetRange,
                                    },
                                ] as LocationLink[];
                            }
                        }
                    }
                }

                return [];
            },
        };
    },
};
