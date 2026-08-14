import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '/tmp/sportlog-vite-cache',
  build: {
    outDir: 'dist',
  },
});
