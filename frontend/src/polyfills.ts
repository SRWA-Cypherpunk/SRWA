import { Buffer } from 'buffer';

// Polyfill global para Buffer (necessário para Solana)
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
}

export {};
