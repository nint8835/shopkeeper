import { defineConfig } from '@openapi-codegen/cli';
import {
    forceReactQueryComponent,
    generateReactQueryComponents,
    generateSchemaTypes,
} from '@openapi-codegen/typescript';
export default defineConfig({
    shopkeeper: {
        from: {
            source: 'url',
            url: 'http://127.0.0.1:8000/openapi.json',
        },
        outputDir: 'frontend/src/queries/api',
        to: async (context) => {
            context.openAPIDocument = forceReactQueryComponent({
                openAPIDocument: context.openAPIDocument,
                component: 'useQuery',
                operationId: 'get_listings',
            });

            const filenamePrefix = 'shopkeeper';
            const { schemasFiles } = await generateSchemaTypes(context, {
                filenamePrefix,
            });
            await generateReactQueryComponents(context, {
                filenamePrefix,
                schemasFiles,
            });
        },
    },
});
