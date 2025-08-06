import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// REMOVE the tailwindcss import and plugin
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
    }
});
