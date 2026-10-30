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
