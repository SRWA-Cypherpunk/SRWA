import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy para Horizon Testnet - resolve CORS em desenvolvimento
      '/api/horizon-testnet': {
        target: 'https://horizon-testnet.stellar.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horizon-testnet/, ''),
        secure: true,
      },
      // Proxy para Horizon Mainnet - resolve CORS em desenvolvimento
      '/api/horizon-mainnet': {
        target: 'https://horizon.stellar.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horizon-mainnet/, ''),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
    },
  },
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: [
      '@coral-xyz/anchor',
      '@solana/web3.js',
      'buffer',
    ],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Solana wallet adapters and Anchor
          'solana-vendor': [
            '@coral-xyz/anchor',
            '@solana/web3.js',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-backpack',
            '@solana/wallet-adapter-solflare',
            '@solana/wallet-adapter-torus',
          ],
          // UI libraries
          'ui-vendor': [
            'framer-motion',
            'lucide-react',
            'recharts',
          ],
          // Query and state management
          'state-vendor': [
            '@tanstack/react-query',
            'zustand',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
