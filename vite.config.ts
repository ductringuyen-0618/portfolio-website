import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/portfolio-website/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
    },
    watch: {
      usePolling: true,
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})
