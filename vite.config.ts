import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The `base` property must be '/' for client-side routing with React Router to work correctly.
  // This ensures that asset paths are resolved from the domain root, regardless of the current URL path.
  base: '/',
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000'),
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000'),
  },
});
