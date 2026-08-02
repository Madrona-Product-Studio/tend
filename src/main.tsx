import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './styles/global.css';
import App from './App';

// Privacy-friendly page analytics (no cookies); no-ops outside Vercel deploys.
inject();

// A fresh deploy invalidates the old build's hashed chunks, but the PWA
// service worker from before the deploy keeps serving its precached (stale)
// index.html — so the import 404s, and a plain reload just gets the same
// stale page back from the same stale worker. Recovery must evict the worker:
// unregister it and drop its caches, THEN reload so the network serves the
// new build (which re-registers a fresh worker). Session-guarded against
// loops if something is truly broken.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'gardenhq:reloaded-for-update';
  if (sessionStorage.getItem(KEY)) return; // already tried once — surface the error
  event.preventDefault();
  sessionStorage.setItem(KEY, '1');
  void (async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } finally {
      window.location.reload();
    }
  })();
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
