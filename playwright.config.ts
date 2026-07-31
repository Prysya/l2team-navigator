import { defineConfig } from '@playwright/test';

const basePath = process.env.VITE_BASE_PATH || '';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: `http://localhost:5173${basePath}`,
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      VITE_PLAYWRIGHT_TEST: '1',
      ...(process.env.VITE_BASE_PATH ? { VITE_BASE_PATH: process.env.VITE_BASE_PATH } : {}),
    },
  },
});
