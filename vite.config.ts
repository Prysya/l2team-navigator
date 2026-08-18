import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { pwaConfig } from './src/pwa/config';

const dir = import.meta.dirname;

export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  base: '/l2team-navigator/',
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      '@': resolve(dir, 'src'),
      '@components': resolve(dir, 'src/components'),
      '@utils': resolve(dir, 'src/utils'),
      '@styles': resolve(dir, 'src/styles'),
      '@data': resolve(dir, 'src/data'),
      '@shared': resolve(dir, 'src/components/shared'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules', 'e2e', '.opencode'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
