import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { StoreProvider } from './state/store';
import { ToastProvider } from './state/toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/wool.css';

// Offline support (public/sw.js). The entry file's name changes with every build, so passing it
// along makes each deploy install a fresh offline copy.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const build = new URL(import.meta.url).pathname.split('/').pop() ?? '';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`./sw.js?build=${encodeURIComponent(build)}`).catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ToastProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ToastProvider>
    </I18nProvider>
  </StrictMode>,
);
