
import { XMLParser } from "fast-xml-parser";
import * as vscode from 'vscode';

export const parseXML = (content: string) => {
    const parser = new XMLParser({
        parseAttributeValue: true,
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        parseTagValue: true,
        commentPropName: 'comment',
        numberParseOptions: {
            hex: true,
            leadingZeros: false,
            eNotation: true
        },
    });

    return parser.parse(content);
}