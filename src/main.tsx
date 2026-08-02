import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './styles/global.css';
import App from './App';

// Privacy-friendly page analytics (no cookies); no-ops outside Vercel deploys.
inject();

// A fresh deploy invalidates the old build's hashed chunks, but a tab (or the
// PWA service worker) that loaded before the deploy can still request them —
// the import 404s and navigation dies. Reload once to pick up the new build;
// the sessionStorage guard prevents a reload loop if something is truly broken.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'gardenhq:reloaded-for-update';
  if (!sessionStorage.getItem(KEY)) {
    event.preventDefault();
    sessionStorage.setItem(KEY, '1');
    window.location.reload();
  }
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
