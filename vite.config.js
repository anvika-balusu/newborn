import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['baby-icon.svg'],
      manifest: {
        name: 'Avika Tracker',
        short_name: 'Avika',
        description: 'Track your newborn\'s feeds, diapers, sleep and more',
        theme_color: '#f9a8d4',
        background_color: '#fdf4ff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'baby-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
