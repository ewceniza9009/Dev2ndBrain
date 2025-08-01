import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The proxy is now handled by the backend CORS policy.
    // This setup is simpler and more robust.
  }
})