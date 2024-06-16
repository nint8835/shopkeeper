import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    root: 'shopkeeper/web/frontend',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/docs': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/openapi.json': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
});
