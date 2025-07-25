import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: './', // Wichtig für relative Pfade im Build
  server: {
    host: '0.0.0.0', // Listen on all addresses
    port: parseInt(process.env.PORT || '3000')
  },
  preview: {
    host: '0.0.0.0', // Listen on all addresses
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: ['flottlog.lipahub.de', 'localhost']
  }
});
