import * as vscode from "vscode";
import { parseXML } from "../utils/parse";

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

const checkRefFileExists = async (struct: any): Promise<ICheckRes> => {
    const checkRes: ICheckRes = {
        result: true,
        properties: []
    };

    extractStructFileRef(struct).forEach(res => {
        checkRes.properties.push({
            name: res.propertyName,
            file: res.propertyValue,
            result: true
        });
    });

    await Promise.all(checkRes.properties.map(async (p, index) => {
       const res = await vscode.workspace.findFiles(`${p.file}`);

       checkRes.properties[index].result = res.length > 0;

       if (res.length === 0) {
        checkRes.result = false;
       }
    }));

    console.log(`checkRefFileExists:`, checkRes);

    return checkRes;
}

export const scanFile = async (e: vscode.Uri) => {
    const file = await vscode.workspace.fs.readFile(e);
    const fileContent = file.toString();
    const xmlStruct = parseXML(fileContent);
    console.log('xmlStruct', xmlStruct);

    const checkRes = await checkRefFileExists(xmlStruct);

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