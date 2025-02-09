import * as vscode from 'vscode';

export class FileResResolver {
    static inst: FileResResolver | null = null;
    diagnostics: vscode.DiagnosticCollection | null = null;
    private lastCache = new Map<vscode.Uri, string>();
    private nextCache = new Map<vscode.Uri, string>();
    private recording = false;

    static self() {
        if (!FileResResolver.inst) {
            FileResResolver.inst = new FileResResolver();
            FileResResolver.inst.init();
        }

        return FileResResolver.inst;
    }

    init() {
        this.diagnostics = vscode.languages.createDiagnosticCollection(
            'RWR Mod Tool: XML Validator',
        );
    }

    private getCacheKey(diagnostics: readonly vscode.Diagnostic[]) {
        const cacheStr = diagnostics.map((d) => {
            // line
            const sl = d.range.start.line;
            // column
            const sc = d.range.start.character;
            
            const el = d.range.end.line;
            const ec = d.range.end.character;

            return `SL::${sl}|SC::${sc}|EL::${el}|EC::${ec}|M::${d.message}`;
        }).join('[|]');
        return cacheStr;
    }

    private parseCacheKey(cacheStr: string): vscode.Diagnostic[] {
        const cacheList = cacheStr.split('[|]');
        const diagnostics = cacheList.map((cacheItem) => {
            const cacheItemSplit = cacheItem.split('|');

            const sl = parseInt(cacheItemSplit[0].split('::')[1]);
            const sc = parseInt(cacheItemSplit[1].split('::')[1]);
            const el = parseInt(cacheItemSplit[2].split('::')[1]);
            const ec = parseInt(cacheItemSplit[3].split('::')[1]);
            const message = cacheItemSplit[4].split('::')[1];

            return {
                severity: vscode.DiagnosticSeverity.Warning,
                message,
                range: new vscode.Range(
                    new vscode.Position(sl, sc),
                    new vscode.Position(el, ec),
                ),
            };
        });

        return diagnostics;
    }

    private saveCache() {
        this.lastCache.clear();
        this.diagnostics?.forEach((uri, diagnostics) => {
            const cacheStr = this.getCacheKey(diagnostics);
            this.lastCache.set(uri, cacheStr);
        });
    }

    diffCache(): {
        added: Map<vscode.Uri, string>;
        removed: Map<vscode.Uri, string>;
        changed?: Map<vscode.Uri, string>;
    } {
        const added = new Map<vscode.Uri, string>();
        const removed = new Map<vscode.Uri, string>();
        const changed = new Map<vscode.Uri, string>();

        this.nextCache.forEach((cacheStr, uri) => {
            if (!this.lastCache.has(uri)) {
                added.set(uri, cacheStr);
            } else {
                const lastCacheStr = this.lastCache.get(uri);
                if (lastCacheStr !== cacheStr) {
                    changed.set(uri, cacheStr);
                }
            }
        });

        this.lastCache.forEach((cacheStr, uri) => {
            if (!this.nextCache.has(uri)) {
                removed.set(uri, cacheStr);
            }
        });

        return {
            added,
            removed,
            changed,
        };
    }

    writeDiagnostic() {
        const { added, removed, changed } = this.diffCache();

        console.log('added', added, 'removed', removed, 'changed', changed);

        removed.forEach((cacheStr, uri) => {
            this.diagnostics?.delete(uri);
        });

        const readyToSetArray: Array<[vscode.Uri, readonly vscode.Diagnostic[]]> = []; 

        added.forEach((cacheStr, uri) => {
            const diagnostic = this.parseCacheKey(cacheStr);
            readyToSetArray.push([uri, diagnostic]);
        });

        changed?.forEach((cacheStr, uri) => {
            const diagnostic = this.parseCacheKey(cacheStr);
            readyToSetArray.push([uri, diagnostic]);
        });

        this.diagnostics?.set(readyToSetArray);
    }

    clear() {
        this.saveCache();
        this.diagnostics?.clear();
    }

    startRecoding() {
        this.saveCache();
        this.nextCache.clear();
        this.recording = true;
    }

    stopRecoding() {
        this.writeDiagnostic();
        this.recording = false;
        this.saveCache();
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

    removeMissingFileWarn(uri: vscode.Uri) {
        this.diagnostics?.delete(uri);
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

        const diagnostic = this.uniqueRangeList(rangeList).map((r) => {
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
        });

        if (this.recording) {
            const cacheStr = this.getCacheKey(diagnostic);
            this.nextCache.set(uri, cacheStr);
            return;
        }

        this.diagnostics?.set(uri, diagnostic);
    }
}
