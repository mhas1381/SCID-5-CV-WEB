import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id: string) {
          if (id.includes('node_modules/lucide-react')) return 'ui'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
          if (id.includes('node_modules/react-router')) return 'vendor'
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'i18n'
          if (id.includes('node_modules/zod') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) return 'forms'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'anim'
          if (id.includes('node_modules/sonner')) return 'ui'
          if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/redux') || id.includes('node_modules/reselect')) return 'redux'
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
})