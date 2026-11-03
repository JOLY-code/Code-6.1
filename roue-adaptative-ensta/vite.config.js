import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import r2aServerPlugin from './server/r2aServerPlugin.js';

// Configuration Vite compatible Vercel Cloud (SPA 24/7) et développement local
export default defineConfig({
  base: '/',
  plugins: [react(), r2aServerPlugin()],
  server: {
    host: true,
    port: 5173,
    open: false,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
});
