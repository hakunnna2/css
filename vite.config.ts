import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is not strictly necessary when using `netlify dev`,
  // but can be useful for other local server setups.
  server: {
    proxy: {
      '/api': 'http://localhost:8888'
    }
  }
});
