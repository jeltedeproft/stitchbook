import { useMemo, useState } from 'react';
import { sortByRecent } from '../domain/projects';
import { useI18n } from '../i18n/I18nProvider';
import { href } from '../router';
import { useStore } from '../state/store';
import { EmptyState } from '../ui/bits';
import { PlusIcon } from '../ui/icons';
import { ProjectCard } from '../ui/ProjectCard';
import { ConfirmDialog } from '../ui/Sheet';
import { useToast } from '../state/toast';

/** The start screen: a greeting and the projects, most recently worked on first. */
export function OverviewScreen() {
  const { projects, removeSamples } = useStore();
  const toast = useToast();
  const { t, tp } = useI18n();
  const [showArchived, setShowArchived] = useState(false);
  const [confirmSamples, setConfirmSamples] = useState(false);

  const visible = useMemo(
    () => sortByRecent(projects.filter((p) => p.archived === showArchived)),
    [projects, showArchived],
  );
  const archivedCount = projects.filter((p) => p.archived).length;
  const hasSamples = projects.some((p) => p.isSample);

  const newProjectLink = (
    <a className="btn btn--primary" href={href.newProject()}>
      <PlusIcon size={18} /> {t('common.newProject')}
    </a>
  );

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow eyebrow--hand">{t(greetingKey())}</p>
          <h1>{t(showArchived ? 'overview.listArchived' : 'overview.title')}</h1>
        </div>
        <a className="btn btn--primary hero__new" href={href.newProject()}>
          <PlusIcon size={18} /> {t('common.newProject')}
        </a>
      </section>

      {hasSamples && (
        <div className="notice">
          <p>
            <strong>{t('overview.sampleStrong')}</strong>
            {t('overview.sampleRest')}
          </p>
          <button type="button" className="btn btn--soft btn--sm" onClick={() => setConfirmSamples(true)}>
            {t('samples.remove')}
          </button>
        </div>
      )}

      {visible.length > 0 ? (
        <ul className="pgrid" aria-label={t(showArchived ? 'overview.listArchived' : 'overview.list')}>
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </ul>
      ) : projects.length === 0 ? (
        <EmptyState title={t('overview.emptyTitle')} action={newProjectLink}>
          {t('overview.emptyBody')}
        </EmptyState>
      ) : showArchived ? (
        <EmptyState art="search" title={t('overview.noArchivedTitle')}>
          {t('overview.noArchivedBody')}
        </EmptyState>
      ) : (
        <EmptyState title={t('overview.allArchivedTitle')} action={newProjectLink}>
          {t('overview.allArchivedBody')}
        </EmptyState>
      )}

      {(showArchived || archivedCount > 0) && (
        <button type="button" className="link-btn overview__archived" onClick={() => setShowArchived((x) => !x)}>
          {showArchived ? t('overview.showCurrent') : t('overview.showArchived', { count: archivedCount })}
        </button>
      )}

      {confirmSamples && (
        <ConfirmDialog
          title={t('samples.confirmTitle')}
          message={t('samples.confirmBody')}
          confirmLabel={t('samples.remove')}
          onCancel={() => setConfirmSamples(false)}
          onConfirm={async () => {
            setConfirmSamples(false);
            const n = await removeSamples();
            toast({ message: tp('samples.removed', n) });
          }}
        />
      )}
    </div>
  );
}

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'overview.morning' as const;
  if (h < 18) return 'overview.afternoon' as const;
  return 'overview.evening' as const;
}
