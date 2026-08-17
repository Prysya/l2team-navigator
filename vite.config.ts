import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const dir = import.meta.dirname;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      showMaximumFileSizeToCacheInBytesWarning: true,
      manifest: {
        name: 'L2team Database',
        short_name: 'L2team',
        description: 'База данных Lineage 2 Essence: рецепты, заклинания, локации, рейд-боссы и квесты',
        lang: 'ru',
        start_url: '/l2team-navigator/',
        scope: '/l2team-navigator/',
        display: 'standalone',
        background_color: '#05070d',
        theme_color: '#05070d',
        icons: [
          { src: 'images/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'images/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'images/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,woff,woff2,ttf,ico,svg,webmanifest}',
          'images/logo*',
          'images/pwa-*',
          'images/maskable-*',
          'images/apple-touch-*',
          'telegram-web-app.js',
        ],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(js|json)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lazy-chunks',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/images\/(bosses|quests)\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: /\/maps\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'maps',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: /https:\/\/mw2\.wiki|https:\/\/lu4db\./,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wiki-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
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
