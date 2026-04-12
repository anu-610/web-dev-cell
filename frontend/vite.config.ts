import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy /api/v1/* → FastAPI on port 8000 (eliminates CORS in dev)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Proxy /uploads/* → FastAPI static files
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
        },
      },
    },
  },
})
