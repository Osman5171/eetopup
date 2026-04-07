import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'], // আপনার public ফোল্ডারে logo.png থাকতে হবে
      manifest: {
        name: 'Eagle Eye Topup',
        short_name: 'EagleEye',
        description: 'Fastest Game Top-up Service in Bangladesh',
        theme_color: '#0052FF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})