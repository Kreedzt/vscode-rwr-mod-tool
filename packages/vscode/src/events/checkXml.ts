import * as vscode from 'vscode';
import * as _ from 'lodash';
import { parseXML } from '../utils/parse';
import { getAllPosition } from '../utils/file';
import { FileResResolver } from './fileResResolver';
import { TaskService } from '../services/task';

const FILEREF_PROPERTY_KEYS: string[] = [
    '@_file',
    '@_file_name',
    '@_filename',
    '@_fileref',
    // faction define
    '@_firstnames_file',
    '@_lastnames_file',
    '@_chat_icon_filename',
    '@_chat_icon_filename_supporter',
    '@_chat_icon_commander_filename',
    '@_campaign_completion_icon_filename',
    // vehicle define
    '@_mesh_filename',
    '@_texture_filename',
];

interface IExtractStructFileResItem {
    propertyName: string;
    propertyValue: string;
}

const extractStructFileRef = (
    struct: Record<string, any>,
): IExtractStructFileResItem[] => {
    const result: IExtractStructFileResItem[] = [];

    let currentLoop = [struct];

    while (currentLoop.length !== 0) {
        const nextLoop: any[] = [];
        currentLoop.forEach((s) => {
            Object.entries(s).forEach(([k, v]) => {
                if (FILEREF_PROPERTY_KEYS.includes(k)) {
                    result.push({
                        propertyName: k,
                        propertyValue: v,
                    });
                } else if (Array.isArray(v)) {
                    v.forEach((arrItem) => {
                        if (typeof arrItem === 'object') {
                            nextLoop.push(arrItem);
                        }
                    });
                } else if (typeof v === 'object') {
                    nextLoop.push(v);
                }
            });
        });

        currentLoop = nextLoop;
    }

    return result.filter((v) => v.propertyValue.trim() !== '');
};

interface ICheckRes {
    result: boolean;
    properties: Array<{
        name: string;
        file: string;
        result: boolean;
    }>;
}

const checkRefFileExists = async (
    e: vscode.Uri,
    fileContent: string,
    struct: any,
): Promise<ICheckRes> => {
    const checkRes: ICheckRes = {
        result: true,
        properties: [],
    };

    const allStructFileRef = extractStructFileRef(struct);

    if (allStructFileRef.length === 0) {
        return checkRes;
    }

    let allFileRefSet = new Set<string>();

    allStructFileRef.forEach((p) => {
        allFileRefSet.add(p.propertyValue);
    });

    const globPattern = `**/{${[...allFileRefSet].join(',')}}`;

    const allFieldsResult = await vscode.workspace.findFiles(globPattern);

    let allAvaiableFileSet = new Set<string>();

    allFieldsResult.forEach((u) => {
        const sp = u.path.split('/');
        const fileName = sp[sp.length - 1];
        allAvaiableFileSet.add(fileName);
    });

    allStructFileRef.forEach((p) => {
        const result = allAvaiableFileSet.has(p.propertyValue);

        if (!result) {
            checkRes.result = false;
        }
        checkRes.properties.push({
            name: p.propertyName,
            file: p.propertyValue,
            result: allAvaiableFileSet.has(p.propertyValue),
        });
    });

    // mark error
    const rangeList: Array<{
        line: number;
        character: number;
        file: string;
    }> = [];
    checkRes.properties
        .filter((p) => !p.result)
        .forEach((property) => {
            const pos = getAllPosition(fileContent, property.file);

            pos.forEach((p) => {
                rangeList.push({
                    line: p.line,
                    character: p.character,
                    file: property.file,
                });
            });
        });

    if (!checkRes.result) {
        FileResResolver.self().addMissingFileWarn(e, rangeList);
    }

    return checkRes;
};

export const scanFile = async (e: vscode.Uri) => {
    const file = await vscode.workspace.fs.readFile(e);
    const fileContent = file.toString();
    const xmlStruct = parseXML(fileContent);
    console.log('xmlStruct', xmlStruct);

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
    console.log('startXmlCheck');

    if (!TaskService.self().getReady()) {
        return;
    }

    return new Promise<void>((resolve) => {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Window,
                cancellable: false,
                title: 'RWR Mod Tool: Scanning file...',
            },
            async (progress) => {
                progress.report({
                    increment: 0,
                });
                // clear warning
                FileResResolver.self().clear();

                const [calls, factions, items, weapons] = await Promise.all([
                    vscode.workspace.findFiles('**/calls/*.{xml,call}'),
                    vscode.workspace.findFiles('**/factions/*.{models,xml}'),
                    vscode.workspace.findFiles('**/items/*.{carry_item,base}'),
                    vscode.workspace.findFiles('**/weapons/*.{weapon,xml}'),
                ]);

                const allUri = [...calls, ...factions, ...items, ...weapons];
                console.log('allUrl', allUri);

                let processed = 0;

                await Promise.all(
                    allUri.map(async (f) => {
                        await scanFile(f);

                        ++processed;
                        const progressPercent =
                            (processed / allUri.length) * 100;
                        progress.report({
                            increment: (1 / allUri.length) * 100,
                            message: `${progressPercent.toFixed()}%`,
                        });
                    }),
                );

                resolve();

                progress.report({
                    increment: 100,
                });
            },
        );
    });
};
