import { useEffect, useId, useState, type FormEvent } from 'react';
import { addComponent, removeComponent, restoreComponent, updateComponent } from '../domain/components';
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL } from '../domain/craft';
import { setArchived, updateProject } from '../domain/projects';
import { projectProgress } from '../domain/progress';
import type { Craft, Project, ProjectStatus } from '../domain/types';
import { LIMITS, validateName } from '../domain/validation';
import { href, navigate } from '../router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { CraftTag, EmptyState, ProgressBar, ProjectVisual } from '../ui/bits';
import { ComponentCard } from '../ui/ComponentCard';
import { ComponentEditor } from '../ui/ComponentEditor';
import { ArchiveIcon, BackIcon, EditIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { MaterialsSection } from '../ui/MaterialsSection';
import { ConfirmDialog } from '../ui/Sheet';

const PRESETS: Record<Craft, string[]> = {
  knitting: ['Body', 'Front', 'Back', 'Left sleeve', 'Right sleeve', 'Collar', 'Cuff', 'Heel', 'Toe'],
  crochet: ['Squares', 'Body', 'Border', 'Sleeve', 'Brim', 'Strap'],
  sewing: ['Bodice', 'Skirt', 'Sleeves', 'Collar', 'Pockets', 'Lining', 'Hem'],
  other: ['Part 1', 'Part 2'],
};

export function ProjectScreen({ id, focus }: { id: string; focus?: string }) {
  const { getProject, update, remove } = useStore();
  const toast = useToast();
  const project = getProject(id);
  const [editingId, setEditingId] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`component-${focus}`);
    el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [focus]);

  if (!project) {
    return (
      <div className="page">
        <EmptyState
          art="search"
          title="Project not found"
          action={<a className="btn btn--primary" href={href.overview()}>Back to projects</a>}
        >
          It may have been deleted on this device.
        </EmptyState>
      </div>
    );
  }

  const editing = project.components.find((c) => c.id === editingId);

  const archive = () => {
    update(project.id, (p) => setArchived(p, true));
    navigate(href.overview());
    toast({
      message: `Archived “${project.name}”.`,
      actionLabel: 'Undo',
      onAction: () => update(project.id, (p) => setArchived(p, false)),
    });
  };

  const removePart = (componentId: string) => {
    let removed: ReturnType<typeof removeComponent> | undefined;
    update(project.id, (p) => {
      removed = removeComponent(p, componentId);
      return removed?.project ?? p;
    });
    setEditingId(undefined);
    if (!removed) return;
    const { component, index } = removed;
    toast({
      message: `Removed “${component.name}”.`,
      actionLabel: 'Undo',
      onAction: () => update(project.id, (p) => restoreComponent(p, component, index)),
    });
  };

  return (
    <div className="page page--project">
      <a className="back-link" href={href.overview()}>
        <BackIcon size={18} /> All projects
      </a>

      <section className="phero">
        <ProjectVisual project={project} className="phero__visual" />
        <div className="phero__body">
          <div className="pcard__tags">
            <CraftTag project={project} />
            {project.isSample && <span className="badge badge--sample">Sample</span>}
            {project.archived && <span className="badge badge--archived">Archived</span>}
          </div>
          <h1>{project.name}</h1>
          <div className="phero__row">
            <label htmlFor="project-status" className="visually-hidden">Project status</label>
            <select
              id="project-status"
              className={`status-select status-select--${project.status}`}
              value={project.status}
              onChange={(e) => update(project.id, (p) => updateProject(p, { status: e.target.value as ProjectStatus }))}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</option>
              ))}
            </select>
            <a className="btn btn--soft btn--sm" href={href.edit(project.id)}>
              <EditIcon size={16} /> Edit details
            </a>
          </div>
          <ProgressBar value={projectProgress(project)} label="Project progress" />
        </div>
      </section>

      <section className="section" aria-labelledby="parts-heading">
        <div className="section__head">
          <h2 id="parts-heading">Parts</h2>
          <span className="muted">{project.components.length || 'None yet'}</span>
        </div>
        {project.components.length === 0 && (
          <EmptyState art="parts" title="Break it into parts">
            A sweater might have a body, two sleeves and a collar. Each part gets its own counters, size and colours.
          </EmptyState>
        )}
        <div className="parts">
          {project.components.map((c, i) => (
            <ComponentCard
              key={c.id}
              project={project}
              component={c}
              index={i}
              highlighted={c.id === project.lastComponentId}
              onEdit={() => setEditingId(c.id)}
            />
          ))}
        </div>
        <AddComponentForm project={project} onAdd={(name) => update(project.id, (p) => addComponent(p, name))} />
      </section>

      <MaterialsSection project={project} />

      {project.notes && (
        <section className="section" aria-labelledby="notes-heading">
          <div className="section__head">
            <h2 id="notes-heading">Notes</h2>
          </div>
          <p className="notes">{project.notes}</p>
        </section>
      )}

      <section className="danger-zone" aria-label="Archive or delete">
        {project.archived ? (
          <>
            <button type="button" className="btn btn--soft" onClick={() => update(project.id, (p) => setArchived(p, false))}>
              <ArchiveIcon size={18} /> Restore from archive
            </button>
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmDelete(true)}>
              <TrashIcon size={18} /> Delete forever
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={archive}>
            <ArchiveIcon size={18} /> Archive project
          </button>
        )}
      </section>

      {editing && (
        <ComponentEditor
          key={editing.id}
          project={project}
          component={editing}
          onClose={() => setEditingId(undefined)}
          onRemove={() => removePart(editing.id)}
          onSave={(patch) => {
            update(project.id, (p) => updateComponent(p, editing.id, patch));
            setEditingId(undefined);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this project forever?"
          message={`“${project.name}” and all its parts, counts and materials will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete forever"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setConfirmDelete(false);
            navigate(href.overview());
            await remove(project.id);
            toast({ message: `Deleted “${project.name}”.` });
          }}
        />
      )}
    </div>
  );
}

function AddComponentForm({ project, onAdd }: { project: Project; onAdd(name: string): void }) {
  const uid = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const existing = new Set(project.components.map((c) => c.name.toLowerCase()));
  const suggestions = PRESETS[project.craft].filter((s) => !existing.has(s.toLowerCase())).slice(0, 5);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateName(name, LIMITS.componentName, 'Part name');
    setError(err);
    if (err) return;
    onAdd(name);
    setName('');
  };

  return (
    <form className="add-part" onSubmit={submit} noValidate>
      <label htmlFor={`${uid}-name`} className="label">Add a part</label>
      <div className="add-part__row">
        <input
          id={`${uid}-name`}
          value={name}
          maxLength={LIMITS.componentName}
          placeholder="e.g. Left sleeve"
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-err` : undefined}
        />
        <button type="submit" className="btn btn--primary">
          <PlusIcon size={18} /> Add
        </button>
      </div>
      {error && <p className="field-error" id={`${uid}-err`}>{error}</p>}
      {suggestions.length > 0 && (
        <div className="chips chips--sm" role="group" aria-label="Quick add">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => onAdd(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
