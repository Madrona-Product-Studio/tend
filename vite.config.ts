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
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Tend — garden map & manager',
        short_name: 'Tend',
        description: 'Map, organize, and improve your food garden year over year.',
        theme_color: '#b23a2e',
        background_color: '#f5f1ea',
        display: 'standalone',
        start_url: '/',
        // TODO: add real 192/512 PNG icons; SVG covers most surfaces for now.
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: { alias },
});
