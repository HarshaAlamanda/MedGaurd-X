import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':     { target: 'http://localhost:8001', changeOrigin: true },
      '/predict':  { target: 'http://localhost:8001', changeOrigin: true },
      '/analyze':  { target: 'http://localhost:8001', changeOrigin: true },
      '/analyses': { target: 'http://localhost:8001', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-axios':  ['axios'],
        },
      },
    },
  },
})
