import { Uri } from 'vscode';
import { IValidator } from '../types';
import { parseXML } from '../utils/parse';
import { checkRefFileExists } from '../utils/xmlFileValidator';

export class XmlValidator implements IValidator {
    constructor() {}

    async validate(fileContent: string, fileUri: Uri) {
        const xmlStruct = parseXML(fileContent);

        const checkRes = await checkRefFileExists(
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
