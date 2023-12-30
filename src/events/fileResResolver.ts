import * as vscode from 'vscode';

export class FileResResolver {
    static inst: FileResResolver | null = null;
    diagnostics: vscode.DiagnosticCollection | null = null;

    static self() {
        if (!FileResResolver.inst) {
            FileResResolver.inst = new FileResResolver();
            FileResResolver.inst.init();
        }

        return FileResResolver.inst;
    }

    init() {
        this.diagnostics = vscode.languages.createDiagnosticCollection();
    }

    clear() {
        this.diagnostics?.clear();
    }

    uniqueRangeList(
        rangeList: Array<{
            line: number;
            character: number;
            file: string;
        }>,
    ) {
        const uniqueSet = new Set<string>();
        const dunplicateIndex = new Set<number>();

        rangeList.forEach((r, index) => {
            const uId = `F:${r.file}L:${r.line}C:${r.character}`;

            if (uniqueSet.has(uId)) {
                dunplicateIndex.add(index);
            } else {
                uniqueSet.add(uId);
            }
        });

        return rangeList.filter((_r, i) => !dunplicateIndex.has(i));
    }

    addMissingFileWarn(
        uri: vscode.Uri,
        rangeList: Array<{
            line: number;
            character: number;
            file: string;
        }>,
    ) {
        console.log(`addMissingFileWarn:`, uri, rangeList);

        this.diagnostics?.set(
            uri,
            this.uniqueRangeList(rangeList).map((r) => {
                return {
                    severity: vscode.DiagnosticSeverity.Warning,
                    message: `Resource not found: ${r.file}`,
                    range: new vscode.Range(
                        new vscode.Position(r.line, r.character),
                        new vscode.Position(
                            r.line,
                            r.character + r.file.length,
                        ),
                    ),
                };
            }),
        );
    }
}
