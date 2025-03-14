import { CodeMapping, LanguagePlugin, VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';

export const angelscriptLanguagePlugin: LanguagePlugin<URI> = {
    getLanguageId(uri) {
        if (uri.path.endsWith('.as')) {
            return 'angelscript';
        }
    },
    createVirtualCode(_uri, languageId, snapshot) {
        if (languageId === 'angelscript') {
            return new AngelScriptVirtualCode(snapshot);
        }
    },
};

// const htmlLs = html.getLanguageService();

export class AngelScriptVirtualCode implements VirtualCode {
    id = 'root';
    languageId = 'angelscript';
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
