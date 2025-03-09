import { CodeMapping, LanguagePlugin, VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';

const fileExts = [
    '.xml',
    '.base',
    '.weapon',
    '.carry_item',
    '.models',
    '.call',
];

export const fileResolverLanguagePlugin: LanguagePlugin<URI> = {
    getLanguageId(uri) {
        if (fileExts.some((ext) => uri.path.endsWith(ext))) {
            return 'xml';
        }
    },
    createVirtualCode(_uri, languageId, snapshot) {
        if (languageId === 'xml') {
            return new FileResolverVirtualCode(snapshot);
        }
    },
};

// const htmlLs = html.getLanguageService();

export class FileResolverVirtualCode implements VirtualCode {
    id = 'root';
    languageId = 'xml';
    mappings: CodeMapping[];

    constructor(public snapshot: ts.IScriptSnapshot) {
        this.mappings = [
            {
                sourceOffsets: [0],
                generatedOffsets: [0],
                lengths: [snapshot.getLength()],
                data: {
                    completion: true,
                    format: true,
                    navigation: true,
                    semantic: true,
                    structure: true,
                    verification: true,
                },
            },
        ];
    }
}
