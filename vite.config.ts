import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'frontend-build',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['bootstrap', 'react-bootstrap']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000',
      '/bff': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/frontend')
    }
  }
})