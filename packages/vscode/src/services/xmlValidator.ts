import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { IValidator } from '../types';
import { parseXML } from '../utils/parse';
import { getAllPosition } from '../utils/file';
import { FileResResolver } from '../events/fileResResolver';

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

export class XmlValidator implements IValidator {
    constructor() {}

    extractStructFileRef(
        struct: Record<string, any>,
    ): IExtractStructFileResItem[] {
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
    }

    async checkRefFileExists(
        fileUri: Uri,
        fileContent: string,
        xmlStruct: Record<string, any>,
    ) {
        const checkRes: {
            result: boolean;
            properties: Array<{
                name: string;
                file: string;
                result: boolean;
            }>;
        } = {
            result: true,
            properties: [],
        };

        const allStructFileRef = this.extractStructFileRef(xmlStruct);

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
            FileResResolver.self().removeMissingFileWarn(fileUri);
            FileResResolver.self().addMissingFileWarn(fileUri, rangeList);
        }

        return checkRes;
    }

    async validate(fileContent: string, fileUri: Uri) {
        const xmlStruct = parseXML(fileContent);

        const checkRes = await this.checkRefFileExists(
            fileUri,
            fileContent,
            xmlStruct,
        );

        if (!checkRes.result) {
            checkRes.properties.forEach((p) => {
                if (!p.result) {
                    console.log(`Resource not found: :${p.file}`);
                }
            });
        }
    }
}
