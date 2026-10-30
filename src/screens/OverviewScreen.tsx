import { useMemo, useState } from 'react';
import { CRAFTS, PROJECT_STATUSES } from '../domain/craft';
import { continueCandidate, sortByRecent } from '../domain/projects';
import { DEFAULT_FILTER, filterProjects, type ProjectFilter } from '../domain/search';
import { useI18n } from '../i18n/I18nProvider';
import { craftLabel, statusLabel, unitLabel } from '../i18n/labels';
import { href } from '../router';
import { useStore } from '../state/store';
import { EmptyState, ProjectVisual } from '../ui/bits';
import { PlayIcon, PlusIcon, SearchIcon } from '../ui/icons';
import { ProjectCard } from '../ui/ProjectCard';
import { ConfirmDialog } from '../ui/Sheet';
import { useToast } from '../state/toast';

export function OverviewScreen() {
  const { projects, removeSamples } = useStore();
  const toast = useToast();
  const { t, tp } = useI18n();
  const [filter, setFilter] = useState<ProjectFilter>(DEFAULT_FILTER);
  const [confirmSamples, setConfirmSamples] = useState(false);

  const visible = useMemo(() => sortByRecent(filterProjects(projects, filter)), [projects, filter]);
  const resume = continueCandidate(projects);
  const resumeComponent =
    resume?.components.find((c) => c.id === resume.lastComponentId) ??
    resume?.components.find((c) => c.status === 'in_progress');
  const activeCount = projects.filter((p) => !p.archived).length;
  const archivedCount = projects.length - activeCount;
  const hasSamples = projects.some((p) => p.isSample);
  const filtering = filter.query !== '' || filter.status !== 'all' || filter.craft !== 'all';

  const set = (patch: Partial<ProjectFilter>) => setFilter((f) => ({ ...f, ...patch }));
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
          <h1>{t('overview.title')}</h1>
          <p className="muted">
            {activeCount === 0
              ? t('overview.nothing')
              : `${tp('overview.active', activeCount)}${archivedCount ? tp('overview.archivedSuffix', archivedCount) : ''}.`}
          </p>
        </div>
        <a className="btn btn--primary hero__new" href={href.newProject()}>
          <PlusIcon size={18} /> {t('common.newProject')}
        </a>
      </section>

      {resume && resumeComponent && !filter.archived && (
        <a className="resume" href={href.project(resume.id, resumeComponent.id)}>
          <ProjectVisual project={resume} className="resume__visual" />
          <div className="resume__text">
            <span className="eyebrow">{t('overview.resume')}</span>
            <strong className="resume__title">{resume.name}</strong>
            <span>
              {resumeComponent.name}
              {resumeComponent.countersEnabled && (
                <>
                  {' · '}
                  {t(resumeComponent.targetRows ? 'overview.resumeCountTarget' : 'overview.resumeCount', {
                    unit: unitLabel(t, resumeComponent.countUnit),
                    count: resumeComponent.rows,
                    target: resumeComponent.targetRows ?? '',
                  })}
                </>
              )}
            </span>
          </div>
          <span className="resume__go" aria-hidden="true">
            <PlayIcon size={18} />
          </span>
          <span className="visually-hidden">{t('overview.continue')}</span>
        </a>
      )}

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

      <div className="toolbar" role="search">
        <div className="search">
          <SearchIcon />
          <label htmlFor="search" className="visually-hidden">{t('overview.search')}</label>
          <input
            id="search"
            type="search"
            placeholder={t('overview.searchPlaceholder')}
            value={filter.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </div>
        <label htmlFor="craft-filter" className="visually-hidden">{t('craft.label')}</label>
        <select id="craft-filter" className="select-sm" value={filter.craft} onChange={(e) => set({ craft: e.target.value as ProjectFilter['craft'] })}>
          <option value="all">{t('craft.all')}</option>
          {CRAFTS.map((c) => (
            <option key={c} value={c}>{craftLabel(t, c)}</option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label={t('overview.filterStatus')}>
        {(['all', ...PROJECT_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={filter.status === s}
            onClick={() => set({ status: s })}
          >
            {s === 'all' ? t('overview.all') : statusLabel(t, s)}
          </button>
        ))}
        <span className="chips__sep" aria-hidden="true" />
        <button type="button" className="chip" aria-pressed={filter.archived} onClick={() => set({ archived: !filter.archived })}>
          {archivedCount ? t('overview.archivedChipCount', { count: archivedCount }) : t('overview.archivedChip')}
        </button>
      </div>

      {visible.length > 0 ? (
        <ul className="pgrid" aria-label={t(filter.archived ? 'overview.listArchived' : 'overview.list')}>
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </ul>
      ) : projects.length === 0 ? (
        <EmptyState title={t('overview.emptyTitle')} action={newProjectLink}>
          {t('overview.emptyBody')}
        </EmptyState>
      ) : filtering ? (
        <EmptyState
          art="search"
          title={t('overview.noMatchTitle')}
          action={<button type="button" className="btn btn--soft" onClick={() => setFilter({ ...DEFAULT_FILTER, archived: filter.archived })}>{t('overview.clearFilters')}</button>}
        >
          {t('overview.noMatchBody')}
        </EmptyState>
      ) : filter.archived ? (
        <EmptyState art="search" title={t('overview.noArchivedTitle')}>
          {t('overview.noArchivedBody')}
        </EmptyState>
      ) : (
        <EmptyState title={t('overview.allArchivedTitle')} action={newProjectLink}>
          {t('overview.allArchivedBody')}
        </EmptyState>
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
