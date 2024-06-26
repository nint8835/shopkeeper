import { generateSchemaTypes, generateReactQueryComponents } from '@openapi-codegen/typescript';
import { defineConfig } from '@openapi-codegen/cli';
export default defineConfig({
    shopkeeper: {
        from: {
            source: 'url',
            url: 'http://127.0.0.1:8000/openapi.json',
        },
        outputDir: 'shopkeeper/web/frontend/src/queries/api',
        to: async (context) => {
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
