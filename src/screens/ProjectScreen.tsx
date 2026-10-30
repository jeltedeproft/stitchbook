import { useEffect, useId, useState, type FormEvent } from 'react';
import { addComponent, removeComponent, restoreComponent, updateComponent } from '../domain/components';
import { PROJECT_STATUSES } from '../domain/craft';
import { setArchived, updateProject } from '../domain/projects';
import { projectProgress } from '../domain/progress';
import type { Project, ProjectStatus } from '../domain/types';
import { LIMITS, validateName } from '../domain/validation';
import { partPresets } from '../i18n/craftData';
import { useI18n } from '../i18n/I18nProvider';
import { nameIssueText, statusLabel } from '../i18n/labels';
import { href, navigate } from '../router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { CraftTag, EmptyState, ProgressBar, ProjectVisual } from '../ui/bits';
import { ComponentCard } from '../ui/ComponentCard';
import { ComponentEditor } from '../ui/ComponentEditor';
import { ArchiveIcon, BackIcon, EditIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { MaterialsSection } from '../ui/MaterialsSection';
import { ConfirmDialog } from '../ui/Sheet';

export function ProjectScreen({ id, focus }: { id: string; focus?: string }) {
  const { getProject, update, remove } = useStore();
  const toast = useToast();
  const { t } = useI18n();
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
          title={t('common.projectNotFound')}
          action={<a className="btn btn--primary" href={href.overview()}>{t('common.backToProjects')}</a>}
        >
          {t('project.notFoundBody')}
        </EmptyState>
      </div>
    );
  }

  const editing = project.components.find((c) => c.id === editingId);

  const archive = () => {
    update(project.id, (p) => setArchived(p, true));
    navigate(href.overview());
    toast({
      message: t('project.archived', { name: project.name }),
      actionLabel: t('common.undo'),
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
      message: t('project.partRemoved', { name: component.name }),
      actionLabel: t('common.undo'),
      onAction: () => update(project.id, (p) => restoreComponent(p, component, index)),
    });
  };

  return (
    <div className="page page--project">
      <a className="back-link" href={href.overview()}>
        <BackIcon size={18} /> {t('common.allProjects')}
      </a>

      <section className="phero">
        <ProjectVisual project={project} className="phero__visual" />
        <div className="phero__body">
          <div className="pcard__tags">
            <CraftTag project={project} />
            {project.isSample && <span className="badge badge--sample">{t('common.sample')}</span>}
            {project.archived && <span className="badge badge--archived">{t('common.archived')}</span>}
          </div>
          <h1>{project.name}</h1>
          <div className="phero__row">
            <label htmlFor="project-status" className="visually-hidden">{t('project.status')}</label>
            <select
              id="project-status"
              className={`status-select status-select--${project.status}`}
              value={project.status}
              onChange={(e) => update(project.id, (p) => updateProject(p, { status: e.target.value as ProjectStatus }))}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(t, s)}</option>
              ))}
            </select>
            <a className="btn btn--soft btn--sm" href={href.edit(project.id)}>
              <EditIcon size={16} /> {t('project.editDetails')}
            </a>
          </div>
          <ProgressBar value={projectProgress(project)} label={t('progress.project')} />
        </div>
      </section>

      <section className="section" aria-labelledby="parts-heading">
        <div className="section__head">
          <h2 id="parts-heading">{t('project.parts')}</h2>
          <span className="muted">{project.components.length || t('project.noneYet')}</span>
        </div>
        {project.components.length === 0 && (
          <EmptyState art="parts" title={t('project.emptyTitle')}>
            {t('project.emptyBody')}
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
            <h2 id="notes-heading">{t('common.notes')}</h2>
          </div>
          <p className="notes">{project.notes}</p>
        </section>
      )}

      <section className="danger-zone" aria-label={t('project.archiveOrDelete')}>
        {project.archived ? (
          <>
            <button type="button" className="btn btn--soft" onClick={() => update(project.id, (p) => setArchived(p, false))}>
              <ArchiveIcon size={18} /> {t('project.restore')}
            </button>
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmDelete(true)}>
              <TrashIcon size={18} /> {t('project.deleteForever')}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={archive}>
            <ArchiveIcon size={18} /> {t('project.archive')}
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
          title={t('project.deleteTitle')}
          message={t('project.deleteBody', { name: project.name })}
          confirmLabel={t('project.deleteForever')}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setConfirmDelete(false);
            navigate(href.overview());
            await remove(project.id);
            toast({ message: t('project.deleted', { name: project.name }) });
          }}
        />
      )}
    </div>
  );
}

function AddComponentForm({ project, onAdd }: { project: Project; onAdd(name: string): void }) {
  const uid = useId();
  const { t, lang } = useI18n();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const existing = new Set(project.components.map((c) => c.name.toLowerCase()));
  const suggestions = partPresets(project.craft, lang).filter((s) => !existing.has(s.toLowerCase())).slice(0, 5);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = nameIssueText(t, validateName(name, LIMITS.componentName), 'project.partNameRequired', LIMITS.componentName);
    setError(err);
    if (err) return;
    onAdd(name);
    setName('');
  };

  return (
    <form className="add-part" onSubmit={submit} noValidate>
      <label htmlFor={`${uid}-name`} className="label">{t('project.addPart')}</label>
      <div className="add-part__row">
        <input
          id={`${uid}-name`}
          value={name}
          maxLength={LIMITS.componentName}
          placeholder={t('project.addPartPlaceholder')}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-err` : undefined}
        />
        <button type="submit" className="btn btn--primary">
          <PlusIcon size={18} /> {t('common.add')}
        </button>
      </div>
      {error && <p className="field-error" id={`${uid}-err`}>{error}</p>}
      {suggestions.length > 0 && (
        <div className="chips chips--sm" role="group" aria-label={t('project.quickAdd')}>
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
