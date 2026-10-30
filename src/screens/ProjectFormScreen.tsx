import { useState, type FormEvent } from 'react';
import { CRAFTS, CRAFT_LABEL, PROJECT_STATUSES, PROJECT_STATUS_LABEL, SWATCHES } from '../domain/craft';
import { createProject, updateProject } from '../domain/projects';
import type { Craft, ProjectStatus } from '../domain/types';
import { LIMITS, validateName } from '../domain/validation';
import { href, navigate } from '../router';
import { useStore } from '../state/store';
import { EmptyState } from '../ui/bits';
import { BackIcon, CraftIcon } from '../ui/icons';
import { PhotoPicker } from '../ui/PhotoPicker';

export function ProjectFormScreen({ id }: { id?: string }) {
  const { projects, getProject, add, update } = useStore();
  const existing = id ? getProject(id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [craft, setCraft] = useState<Craft>(existing?.craft ?? 'knitting');
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? 'planned');
  const [swatch, setSwatch] = useState(existing?.swatch ?? SWATCHES[projects.length % SWATCHES.length]);
  const [photo, setPhoto] = useState(existing?.photo);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string>();

  if (id && !existing) {
    return (
      <div className="page">
        <EmptyState art="search" title="Project not found" action={<a className="btn btn--primary" href={href.overview()}>Back to projects</a>} />
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateName(name, LIMITS.projectName, 'Project name');
    setError(err);
    if (err) {
      document.getElementById('project-name')?.focus();
      return;
    }
    const input = { name, craft, status, swatch, photo, notes };
    if (existing) {
      update(existing.id, (p) => updateProject(p, input));
      navigate(href.project(existing.id));
    } else {
      const project = createProject(input, projects.length);
      add(project);
      navigate(href.project(project.id));
    }
  };

  const cancelHref = existing ? href.project(existing.id) : href.overview();

  return (
    <div className="page page--narrow">
      <a className="back-link" href={cancelHref}>
        <BackIcon size={18} /> {existing ? existing.name : 'All projects'}
      </a>
      <h1>{existing ? 'Edit project' : 'New project'}</h1>

      <form className="form card" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            value={name}
            maxLength={LIMITS.projectName}
            placeholder="e.g. Autumn socks"
            autoFocus={!existing}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(undefined);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'project-name-err' : undefined}
          />
          {error && <p className="field-error" id="project-name-err" role="alert">{error}</p>}
        </div>

        <fieldset className="field">
          <legend>Craft</legend>
          <div className="craft-picker">
            {CRAFTS.map((c) => (
              <label key={c} className={`craft-option ${craft === c ? 'is-on' : ''}`}>
                <input type="radio" name="craft" value={c} checked={craft === c} onChange={() => setCraft(c)} />
                <CraftIcon craft={c} size={26} />
                <span>{CRAFT_LABEL[c]}</span>
              </label>
            ))}
          </div>
          {craft === 'sewing' && <p className="hint">Row and stitch counters are off by default for sewing parts — switch them on per part if you need them.</p>}
        </fieldset>

        <div className="field">
          <label htmlFor="project-status-input">Status</label>
          <select id="project-status-input" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        <fieldset className="field">
          <legend>Colour tag</legend>
          <p className="hint">Shown on the card when there's no photo.</p>
          <div className="swatch-picker">
            {SWATCHES.map((s, i) => (
              <label key={s} className={`swatch-option ${swatch === s ? 'is-on' : ''}`} style={{ backgroundColor: s }}>
                <input type="radio" name="swatch" value={s} checked={swatch === s} onChange={() => setSwatch(s)} />
                <span className="visually-hidden">Colour {i + 1}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <PhotoPicker value={photo} onChange={setPhoto} />

        <div className="field">
          <label htmlFor="project-notes">Notes</label>
          <textarea
            id="project-notes"
            rows={4}
            value={notes}
            maxLength={LIMITS.projectNotes}
            placeholder="Pattern, size, modifications, who it's for…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="form__actions">
          <a className="btn btn--ghost" href={cancelHref}>Cancel</a>
          <button type="submit" className="btn btn--primary">{existing ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </div>
  );
}
