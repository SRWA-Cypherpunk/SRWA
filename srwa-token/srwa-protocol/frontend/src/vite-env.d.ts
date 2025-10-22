/// <reference types="vite/client" />

import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
  }
}

export {};
