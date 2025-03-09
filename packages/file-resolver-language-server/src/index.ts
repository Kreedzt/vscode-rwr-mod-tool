import {
    createServer,
    createConnection,
    loadTsdkByPath,
    createTypeScriptProject,
} from '@volar/language-server/node';
import { service } from './service';
import { fileResolverLanguagePlugin } from './languagePlugin';

const connection = createConnection();
const server = createServer(connection);

connection.listen();

connection.onInitialize((params) => {
    const tsdk = loadTsdkByPath(
        params.initializationOptions.typescript.tsdk,
        params.locale,
    );

    return server.initialize(
        params,
        createTypeScriptProject(
            tsdk.typescript,
            tsdk.diagnosticMessages,
            () => ({
                languagePlugins: [fileResolverLanguagePlugin],
            }),
        ),
        [service],
    );
});

connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);
