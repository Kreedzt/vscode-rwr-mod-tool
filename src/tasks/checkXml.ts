import * as vscode from "vscode";
import { parseXML } from "../utils/parse";
import { getAllPosition } from "../utils/file";
import { FileResResolver } from "./fileResResolver";

const FILEREF_PROPERTY_KEYS: string[] = ['@_file', '@_file_name'];

interface IExtractStructFileResItem {
    propertyName: string;
    propertyValue: string;
}

const extractStructFileRef = (struct: Record<string, any>): IExtractStructFileResItem[] => {
    const result: IExtractStructFileResItem[] = [];

    let currentLoop = [struct];

    while (currentLoop.length !== 0) {
        const nextLoop: any[] = [];
        currentLoop.forEach(s => {
            Object.entries(s).forEach(([k, v]) => {
                if (FILEREF_PROPERTY_KEYS.includes(k)) {
                    result.push({
                        propertyName: k,
                        propertyValue: v
                    });
                } else if (Array.isArray(v)) {
                    v.forEach(arrItem => {
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

    return result;
}

interface ICheckRes {
    result: boolean;
    properties: Array<{
        name: string;
        file: string;
        result: boolean;
    }>;
}

const checkRefFileExists = async (e: vscode.Uri, fileContent: string, struct: any): Promise<ICheckRes> => {
    const checkRes: ICheckRes = {
        result: true,
        properties: []
    };

    await Promise.all(
        extractStructFileRef(struct).map(async (p) => {
            const res = await vscode.workspace.findFiles(`**/${p.propertyValue}`);

            let result = res.length > 0;

            if (!result) {
                checkRes.result = false;
            }
            checkRes.properties.push({
                name: p.propertyName,
                file: p.propertyValue,
                result
            });
        }));

    // mark error
    const rangeList: Array<{
        line: number;
        character: number;
        file: string;
    }> = [];
    checkRes.properties.forEach(property => {
        const pos = getAllPosition(fileContent, property.file);

        pos.forEach(p => {
            rangeList.push({
                line: p.line,
                character: p.character,
                file: property.file
            })
        })
    });
    FileResResolver.self().addMissingFileWarn(e, rangeList);

    console.log(`checkRefFileExists:`, checkRes);

    return checkRes;
}

export const scanFile = async (e: vscode.Uri) => {
    const file = await vscode.workspace.fs.readFile(e);
    const fileContent = file.toString();
    const xmlStruct = parseXML(fileContent);
    console.log('xmlStruct', xmlStruct);

    const checkRes = await checkRefFileExists(e, fileContent, xmlStruct);

    if (!checkRes.result) {
        checkRes.properties.forEach(p => {
            if (!p.result) {
                console.log(`Resource not found: :${p.file}`);
            }
        });
    }
}

export const startXmlCheck = async () => {
    console.log('startXmlCheck');

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
    await Promise.all(allUri.map(scanFile));
}