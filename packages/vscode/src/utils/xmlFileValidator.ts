import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { FileResResolver } from '../events/fileResResolver';
import { getAllPosition } from './file';

export const FILEREF_PROPERTY_KEYS: string[] = [
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

export interface IExtractStructFileResItem {
    propertyName: string;
    propertyValue: string;
}

export interface ICheckRes {
    result: boolean;
    properties: Array<{
        name: string;
        file: string;
        result: boolean;
    }>;
}

export function extractStructFileRef(
    struct: Record<string, any>,
): IExtractStructFileResItem[] {
    const result: IExtractStructFileResItem[] = [];

    const traverse = (obj: Record<string, any>) => {
        for (const key in obj) {
            if (FILEREF_PROPERTY_KEYS.includes(key)) {
                const value = obj[key];
                if (typeof value === "string" && value.trim() !== "") {
                    result.push({
                        propertyName: key,
                        propertyValue: value,
                    });
                }
            } else if (typeof obj[key] === "object") {
                if (Array.isArray(obj[key])) {
                    obj[key].forEach((item: any) => {
                        if (typeof item === 'object') {
                            traverse(item);
                        }
                    });
                } else {
                    traverse(obj[key]);
                }
            }
        }
    };

    traverse(struct);
    return result;
}

export async function checkRefFileExists(
    fileUri: Uri,
    fileContent: string,
    xmlStruct: Record<string, any>,
): Promise<ICheckRes> {
    const checkRes: ICheckRes = {
        result: true,
        properties: [],
    };

    const allStructFileRef = extractStructFileRef(xmlStruct);

    if (allStructFileRef.length === 0) {
        return checkRes;
    }

    const allFileRefSet = new Set(allStructFileRef.map((p) => p.propertyValue));
    const globPattern = `**/{${[...allFileRefSet].join(',')}}`;
    const allFieldsResult = await vscode.workspace.findFiles(globPattern);

    const allAvaiableFileSet = new Set(
        allFieldsResult.map((u) => {
            const sp = u.path.split('/');
            return sp[sp.length - 1];
        })
    );

    allStructFileRef.forEach((p) => {
        const result = allAvaiableFileSet.has(p.propertyValue);

        if (!result) {
            checkRes.result = false;
        }
        checkRes.properties.push({
            name: p.propertyName,
            file: p.propertyValue,
            result,
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
        FileResResolver.self().addMissingFileWarn(fileUri, rangeList);
    }

    return checkRes;
}
