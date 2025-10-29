import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

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
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      // Ativa todos os polyfills
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192x192.png', 'icons/icon-512x512.png', 'manifest.json'],
      manifest: {
        name: 'SRWA - Real World Assets on Solana',
        short_name: 'SRWA',
        description: 'Institutional-grade DeFi for Real-World Assets on Solana with on-chain compliance, permissioned markets, and hybrid oracles',
        theme_color: '#9945FF',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['finance', 'productivity', 'business']
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/partners/**', '**/docs/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.devnet\.solana\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'solana-rpc-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.solana\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'solana-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 10 * 60, // 10 minutes
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      https: path.resolve(__dirname, "./src/polyfills/https-stub.js"),
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': {},
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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
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
