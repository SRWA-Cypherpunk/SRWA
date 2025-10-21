import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': '/src',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      '@solana/web3.js',
      '@coral-xyz/anchor',
      '@solana/spl-token'
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      }
    }
  },
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
})
