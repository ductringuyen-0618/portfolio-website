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
  // Prevent pre-bundling of WebLLM to avoid WASM issues
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm']
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
    // Note: COOP/COEP headers removed - they break external resources (fonts, CDN)
    // WebLLM will work in browsers that support WebGPU without these headers
  },
  preview: {
    port: 4173,
    host: true
  },
  worker: {
    format: 'es' // ES module workers for WebLLM
  }
})
