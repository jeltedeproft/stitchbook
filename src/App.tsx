import { useRoute, href, type Route } from './router';
import { useStore } from './state/store';
import { useI18n } from './i18n/I18nProvider';
import { OverviewScreen } from './screens/OverviewScreen';
import { ProjectScreen } from './screens/ProjectScreen';
import { ProjectFormScreen } from './screens/ProjectFormScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SettingsIcon } from './ui/icons';

export function App() {
  const route = useRoute();
  const store = useStore();
  const { t, lang, setLang } = useI18n();

  return (
    <>
      <a className="skip-link" href="#main">{t('app.skip')}</a>
      <header className="topbar">
        <a className="brand" href={href.overview()} aria-label={t('app.home')}>
          <Logo />
          <span>Stitchbook</span>
        </a>
        <div className="topbar__actions">
          <button
            type="button"
            className="lang-btn"
            aria-label={t('app.switchLang')}
            lang={lang === 'fr' ? 'en' : 'fr'}
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          >
            {t('app.switchLangShort')}
          </button>
          <a className="icon-btn" href={href.settings()} aria-label={t('app.settings')}>
            <SettingsIcon />
          </a>
        </div>
      </header>

      {store.storageKind === 'memory' && (
        <div className="banner banner--warn" role="alert">
          {t('app.storageBlocked')} <a href={href.settings()}>{t('app.learnMore')}</a>
        </div>
      )}
      {store.saveError && (
        <div className="banner banner--error" role="alert">
          <span>
            {t('app.saveFailed')} <small>{t('app.details', { detail: store.saveError })}</small>
          </span>
          <button type="button" className="btn btn--sm btn--soft" onClick={store.retry}>{t('app.retry')}</button>
        </div>
      )}

      <main id="main" tabIndex={-1}>
        {store.status === 'loading' && <Loading label={t('app.loading')} />}
        {store.status === 'error' && (
          <div className="page">
            <div className="empty">
              <h1>{t('app.loadFailed')}</h1>
              <p>{t('app.loadFailedBody')}</p>
              {store.loadError && <p><small>{t('app.details', { detail: store.loadError })}</small></p>}
              <button type="button" className="btn btn--primary" onClick={store.retry}>{t('app.retry')}</button>
            </div>
          </div>
        )}
        {store.status === 'ready' && <Screen route={route} />}
      </main>
    </>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'new':
      return <ProjectFormScreen />;
    case 'edit':
      return <ProjectFormScreen key={route.id} id={route.id} />;
    case 'project':
      return <ProjectScreen key={route.id} id={route.id} focus={route.focus} />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <OverviewScreen />;
  }
}

function Loading({ label }: { label: string }) {
  return (
    <div className="page" aria-busy="true">
      <p className="visually-hidden" role="status">{label}</p>
      <div className="skeleton skeleton--title" />
      <ul className="pgrid">
        {[0, 1, 2].map((i) => (
          <li key={i} className="skeleton skeleton--card" />
        ))}
      </ul>
    </div>
  );
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="14" cy="18" r="11" fill="var(--c-primary)" />
      <path d="M5 14c6 3 12 3 18 0M4 20c7 4 13 4 20 0M10 8c-3 7-3 15 1 21M18 8c3 7 3 15-1 21" stroke="var(--c-on-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".85" />
      <path d="M22 4l8 20" stroke="var(--c-accent-3)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
