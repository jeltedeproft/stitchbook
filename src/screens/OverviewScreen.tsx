import { useMemo, useState } from 'react';
import { CRAFTS, CRAFT_LABEL, PROJECT_STATUSES, PROJECT_STATUS_LABEL, unitLabel } from '../domain/craft';
import { continueCandidate, sortByRecent } from '../domain/projects';
import { DEFAULT_FILTER, filterProjects, type ProjectFilter } from '../domain/search';
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

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>Your projects</h1>
          <p className="muted">
            {activeCount === 0
              ? 'Nothing on the needles yet.'
              : `${activeCount} project${activeCount === 1 ? '' : 's'} on the go${archivedCount ? `, ${archivedCount} archived` : ''}.`}
          </p>
        </div>
        <a className="btn btn--primary hero__new" href={href.newProject()}>
          <PlusIcon size={18} /> New project
        </a>
      </section>

      {resume && resumeComponent && !filter.archived && (
        <a className="resume" href={href.project(resume.id, resumeComponent.id)}>
          <ProjectVisual project={resume} className="resume__visual" />
          <div className="resume__text">
            <span className="eyebrow">Pick up where you left off</span>
            <strong className="resume__title">{resume.name}</strong>
            <span>
              {resumeComponent.name}
              {resumeComponent.countersEnabled && (
                <>
                  {' · '}
                  {unitLabel(resumeComponent.countUnit)} {resumeComponent.rows}
                  {resumeComponent.targetRows ? ` of ${resumeComponent.targetRows}` : ''}
                </>
              )}
            </span>
          </div>
          <span className="resume__go" aria-hidden="true">
            <PlayIcon size={18} />
          </span>
          <span className="visually-hidden">Continue</span>
        </a>
      )}

      {hasSamples && (
        <div className="notice">
          <p>
            <strong>These are sample projects</strong> to show you around. Your own projects are never mixed with them.
          </p>
          <button type="button" className="btn btn--soft btn--sm" onClick={() => setConfirmSamples(true)}>
            Remove samples
          </button>
        </div>
      )}

      <div className="toolbar" role="search">
        <div className="search">
          <SearchIcon />
          <label htmlFor="search" className="visually-hidden">Search projects</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, yarn, notes…"
            value={filter.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </div>
        <label htmlFor="craft-filter" className="visually-hidden">Craft</label>
        <select id="craft-filter" className="select-sm" value={filter.craft} onChange={(e) => set({ craft: e.target.value as ProjectFilter['craft'] })}>
          <option value="all">All crafts</option>
          {CRAFTS.map((c) => (
            <option key={c} value={c}>{CRAFT_LABEL[c]}</option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label="Filter by status">
        {(['all', ...PROJECT_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={filter.status === s}
            onClick={() => set({ status: s })}
          >
            {s === 'all' ? 'All' : PROJECT_STATUS_LABEL[s]}
          </button>
        ))}
        <span className="chips__sep" aria-hidden="true" />
        <button type="button" className="chip" aria-pressed={filter.archived} onClick={() => set({ archived: !filter.archived })}>
          Archived{archivedCount ? ` (${archivedCount})` : ''}
        </button>
      </div>

      {visible.length > 0 ? (
        <ul className="pgrid" aria-label={filter.archived ? 'Archived projects' : 'Projects'}>
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </ul>
      ) : projects.length === 0 ? (
        <EmptyState
          title="Cast on your first project"
          action={<a className="btn btn--primary" href={href.newProject()}><PlusIcon size={18} /> New project</a>}
        >
          Add a sweater, socks, a blanket or a dress. Break it into parts and count rows as you go.
        </EmptyState>
      ) : filtering ? (
        <EmptyState
          art="search"
          title="No projects match"
          action={<button type="button" className="btn btn--soft" onClick={() => setFilter({ ...DEFAULT_FILTER, archived: filter.archived })}>Clear filters</button>}
        >
          Try another word, or clear the filters to see everything.
        </EmptyState>
      ) : filter.archived ? (
        <EmptyState art="search" title="Nothing archived">
          Finished projects you archive will rest here, out of the way.
        </EmptyState>
      ) : (
        <EmptyState
          title="All your projects are archived"
          action={<a className="btn btn--primary" href={href.newProject()}><PlusIcon size={18} /> New project</a>}
        >
          Time to start something new?
        </EmptyState>
      )}

      {confirmSamples && (
        <ConfirmDialog
          title="Remove sample projects?"
          message="The three sample projects will be deleted. Your own projects are not affected, and samples won't come back."
          confirmLabel="Remove samples"
          onCancel={() => setConfirmSamples(false)}
          onConfirm={async () => {
            setConfirmSamples(false);
            const n = await removeSamples();
            toast({ message: `Removed ${n} sample project${n === 1 ? '' : 's'}.` });
          }}
        />
      )}
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
