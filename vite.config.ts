import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path ensures it works on GitHub Pages subpaths & custom domains
  server: {
    port: 3000,
    open: true,
  },
});
