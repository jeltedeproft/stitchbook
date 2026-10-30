import { useRoute, href, type Route } from './router';
import { useStore } from './state/store';
import { OverviewScreen } from './screens/OverviewScreen';
import { ProjectScreen } from './screens/ProjectScreen';
import { ProjectFormScreen } from './screens/ProjectFormScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SettingsIcon } from './ui/icons';

export function App() {
  const route = useRoute();
  const store = useStore();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href={href.overview()} aria-label="Stitchbook — all projects">
          <Logo />
          <span>Stitchbook</span>
        </a>
        <a className="icon-btn" href={href.settings()} aria-label="Your data, backup and sharing">
          <SettingsIcon />
        </a>
      </header>

      {store.storageKind === 'memory' && (
        <div className="banner banner--warn" role="alert">
          Storage is blocked in this browser, so changes will be lost when this tab closes.{' '}
          <a href={href.settings()}>Learn more</a>
        </div>
      )}
      {store.saveError && (
        <div className="banner banner--error" role="alert">
          {store.saveError} Your changes are still on screen.
          <button type="button" className="btn btn--sm btn--soft" onClick={store.retry}>Try again</button>
        </div>
      )}

      <main id="main" tabIndex={-1}>
        {store.status === 'loading' && <Loading />}
        {store.status === 'error' && (
          <div className="page">
            <div className="empty">
              <h1>We couldn't open your projects</h1>
              <p>{store.loadError}</p>
              <button type="button" className="btn btn--primary" onClick={store.retry}>Try again</button>
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

function Loading() {
  return (
    <div className="page" aria-busy="true">
      <p className="visually-hidden" role="status">Loading your projects…</p>
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
