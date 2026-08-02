import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Path aliases are mirrored in tsconfig.json `paths`.
const alias = {
  '@': '/src',
  '@components': '/src/components',
  '@pages': '/src/pages',
  '@data': '/src/data',
  '@utils': '/src/utils',
  '@services': '/src/services',
  '@hooks': '/src/hooks',
  '@design': '/src/design',
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installable, offline-capable PWA — gardens have poor signal.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-32.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'GardenHQ — garden map & manager',
        short_name: 'GardenHQ',
        description: 'Map, organize, and improve your food garden year over year.',
        theme_color: '#b23a2e',
        background_color: '#f5f1ea',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: { alias },
});
