import * as vscode from 'vscode';
import * as serverProtocol from '@volar/language-server/protocol';
import { createLabsInfo, getTsdk } from '@volar/vscode';
import * as lsp from 'vscode-languageclient/node';

let client: lsp.BaseLanguageClient;

export const registerLSP = async (context: vscode.ExtensionContext) => {
    console.log('registerLSP...');

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

export async function disposeLSP() {
    await client?.stop();
}
