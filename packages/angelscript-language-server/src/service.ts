import { CompletionItemKind } from '@volar/language-server';
import type {
    LanguageServicePlugin,
    LanguageServicePluginInstance,
    DocumentSelector,
    LanguageServiceContext,
    Disposable,
    ProviderResult,
    FormattingOptions,
} from '@volar/language-service';

export const service: LanguageServicePlugin = {
    name: 'angelscript-service',
    capabilities: {
        hoverProvider: true,
    },
    create(context): LanguageServicePluginInstance {
        console.log("angelscript-service created!");
        return {
            // provideHover(document, position, token) {
            //     // Implement hover support here
            // },
            // More methods...
        };
    },
};
