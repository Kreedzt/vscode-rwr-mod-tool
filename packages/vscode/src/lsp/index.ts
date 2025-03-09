import * as vscode from 'vscode';
import * as serverProtocol from '@volar/language-server/protocol';
import { createLabsInfo, getTsdk } from '@volar/vscode';
import * as lsp from 'vscode-languageclient/node';

let client: lsp.BaseLanguageClient;
let resolverClient: lsp.BaseLanguageClient;

const initAngelScriptLSP = async (context: vscode.ExtensionContext) => {
    const serverModule = vscode.Uri.joinPath(
        context.extensionUri,
        'dist',
        'server.js',
    );

    const serverOptions: lsp.ServerOptions = {
        run: {
            module: serverModule.fsPath,
            transport: lsp.TransportKind.ipc,
            options: { execArgv: <string[]>[] },
        },
        debug: {
            module: serverModule.fsPath,
            transport: lsp.TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=' + 6009] },
        },
    };

    const clientOptions: lsp.LanguageClientOptions = {
        documentSelector: [{ language: 'angelscript' }],
        initializationOptions: {
            typescript: {
                tsdk: (await getTsdk(context))!.tsdk,
            },
        },
    };

    client = new lsp.LanguageClient(
        'angelscript-language-server',
        'AngelScript Language Server',
        serverOptions,
        clientOptions,
    );
    await client.start();

    const labsInfo = createLabsInfo(serverProtocol);
    labsInfo.addLanguageClient(client);
};

const initFileResolverLSP = async (context: vscode.ExtensionContext) => {
    const serverModule = vscode.Uri.joinPath(
        context.extensionUri,
        'dist',
        'resolver.js',
    );
    const serverOptions: lsp.ServerOptions = {
        run: {
            module: serverModule.fsPath,
            transport: lsp.TransportKind.ipc,
            options: { execArgv: <string[]>[] },
        },
        debug: {
            module: serverModule.fsPath,
            transport: lsp.TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=' + 6009] },
        },
    };
    const clientOptions: lsp.LanguageClientOptions = {
        documentSelector: [{ language: 'xml' }],
        initializationOptions: {
            typescript: {
                tsdk: (await getTsdk(context))!.tsdk,
            },
        },
    };
    resolverClient = new lsp.LanguageClient(
        'file-resolver-language-server',
        'File Resolver Language Server',
        serverOptions,
        clientOptions,
    );
    await resolverClient.start();
};

export const registerLSP = async (context: vscode.ExtensionContext) => {
    console.log('registerLSP...');
    await initAngelScriptLSP(context);
    await initFileResolverLSP(context);
};

export async function disposeLSP() {
    await client?.stop();
    await resolverClient?.stop();
}
