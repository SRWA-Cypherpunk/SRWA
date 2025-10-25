import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import './index.css';
const rootEl = document.getElementById('root');

async function bootstrap() {
  if (typeof globalThis.Buffer === 'undefined') {
    (globalThis as any).Buffer = Buffer;
  }

  const { default: App } = await import('./App.tsx');

  createRoot(rootEl!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
