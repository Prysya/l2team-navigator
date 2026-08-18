import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  testMatch: 'pwa/**/*.spec.ts',
  use: {
    baseURL: 'http://localhost:4173/l2team-navigator/',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
