import { useId, useState, type FormEvent } from 'react';
import { COMPONENT_STATUSES, COMPONENT_STATUS_LABEL, toolLabel, toolSizeSuggestions } from '../domain/craft';
import { newId } from '../domain/ids';
import type { ColorAssignment, ComponentStatus, CountUnit, Project, ProjectComponent } from '../domain/types';
import { LIMITS, isHexColor, validateName } from '../domain/validation';
import type { ComponentPatch } from '../domain/components';
import { Sheet } from './Sheet';
import { PlusIcon, TrashIcon } from './icons';
import { Swatch } from './bits';

interface Props {
  project: Project;
  component: ProjectComponent;
  onSave(patch: ComponentPatch): void;
  onRemove(): void;
  onClose(): void;
}

const CUSTOM = '__custom__';

export function ComponentEditor({ project, component, onSave, onRemove, onClose }: Props) {
  const uid = useId();
  const [name, setName] = useState(component.name);
  const [status, setStatus] = useState<ComponentStatus>(component.status);
  const [countUnit, setCountUnit] = useState<CountUnit>(component.countUnit);
  const [target, setTarget] = useState(component.targetRows ? String(component.targetRows) : '');
  const [toolSize, setToolSize] = useState(component.toolSize ?? '');
  const [notes, setNotes] = useState(component.notes ?? '');
  const [countersEnabled, setCountersEnabled] = useState(component.countersEnabled);
  const [colors, setColors] = useState<ColorAssignment[]>(component.colors);
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});

  const setColor = (id: string, patch: Partial<ColorAssignment>) =>
    setColors((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addColor = () =>
    setColors((list) => [
      ...list,
      project.materials[0] ? { id: newId(), materialId: project.materials[0].id } : { id: newId(), customHex: '#c2643c' },
    ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nameError = validateName(name, LIMITS.componentName, 'Component name');
    const t = target.trim();
    const targetError = t && !/^\d+$/.test(t) ? 'Use a whole number, or leave empty.' : undefined;
    setErrors({ name: nameError, target: targetError });
    if (nameError || targetError) return;
    onSave({
      name,
      status,
      countUnit,
      targetRows: t ? Number(t) : undefined,
      toolSize,
      notes,
      countersEnabled,
      colors: colors.map((c) => ({ ...c, note: c.note?.trim() || undefined })),
    });
  };

  const unitWord = countUnit === 'round' ? 'rounds' : 'rows';


  return (
    <Sheet
      title={`Edit ${component.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--danger-ghost" onClick={onRemove}>
            <TrashIcon size={18} /> Remove
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={`${uid}-form`} className="btn btn--primary">
            Save
          </button>
        </>
      }
    >
      <form id={`${uid}-form`} className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={`${uid}-name`}>Name</label>
          <input
            id={`${uid}-name`}
            value={name}
            maxLength={LIMITS.componentName}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            data-autofocus
          />
          {errors.name && <p className="field-error" id={`${uid}-name-err`}>{errors.name}</p>}
        </div>

        <fieldset className="field">
          <legend>Status</legend>
          <div className="segmented">
            {COMPONENT_STATUSES.map((s) => (
              <label key={s} className={status === s ? 'is-on' : ''}>
                <input type="radio" name={`${uid}-status`} value={s} checked={status === s} onChange={() => setStatus(s)} />
                {COMPONENT_STATUS_LABEL[s]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-tool`}>{toolLabel(project.craft)}</label>
          <input
            id={`${uid}-tool`}
            list={`${uid}-tools`}
            value={toolSize}
            maxLength={LIMITS.toolSize}
            placeholder="e.g. 4.5 mm"
            onChange={(e) => setToolSize(e.target.value)}
          />
          <datalist id={`${uid}-tools`}>
            {toolSizeSuggestions(project.craft).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <p className="hint">Pick a common size or type your own. Each part can use its own size.</p>
        </div>

        <fieldset className="field">
          <legend>Counting</legend>
          <label className="check">
            <input type="checkbox" checked={countersEnabled} onChange={(e) => setCountersEnabled(e.target.checked)} />
            Track rows/rounds and stitches for this part
          </label>
          {countersEnabled && (
            <div className="field-row">
              <div className="segmented" role="radiogroup" aria-label="Count in">
                {(['row', 'round'] as const).map((u) => (
                  <label key={u} className={countUnit === u ? 'is-on' : ''}>
                    <input type="radio" name={`${uid}-unit`} value={u} checked={countUnit === u} onChange={() => setCountUnit(u)} />
                    {u === 'row' ? 'Rows (flat)' : 'Rounds (in the round)'}
                  </label>
                ))}
              </div>
              <div className="field field--inline">
                <label htmlFor={`${uid}-target`}>Target {unitWord} (optional)</label>
                <input
                  id={`${uid}-target`}
                  inputMode="numeric"
                  value={target}
                  placeholder="e.g. 96"
                  onChange={(e) => setTarget(e.target.value)}
                  aria-invalid={!!errors.target}
                  aria-describedby={errors.target ? `${uid}-target-err` : undefined}
                />
                {errors.target && <p className="field-error" id={`${uid}-target-err`}>{errors.target}</p>}
              </div>
            </div>
          )}
        </fieldset>

        <fieldset className="field">
          <legend>Colours</legend>
          {colors.length === 0 && <p className="hint">No colours yet. Link a yarn or material from this project.</p>}
          <ul className="color-list">
            {colors.map((col, i) => {
              const linked = project.materials.find((m) => m.id === col.materialId);
              const isCustom = !col.materialId;
              return (
                <li key={col.id} className="color-row">
                  <Swatch color={linked?.colorHex ?? col.customHex} />
                  <div className="color-row__fields">
                    <label className="visually-hidden" htmlFor={`${uid}-col-${i}`}>Colour {i + 1}</label>
                    <select
                      id={`${uid}-col-${i}`}
                      value={col.materialId && linked ? col.materialId : col.materialId ? '' : CUSTOM}
                      onChange={(e) =>
                        e.target.value === CUSTOM
                          ? setColor(col.id, { materialId: undefined, customHex: col.customHex ?? '#c2643c' })
                          : setColor(col.id, { materialId: e.target.value })
                      }
                    >
                      {col.materialId && !linked && <option value="">Removed material</option>}
                      {project.materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.colorName ? `${m.colorName} — ${m.name}` : m.name}
                        </option>
                      ))}
                      <option value={CUSTOM}>Other colour…</option>
                    </select>
                    {isCustom && (
                      <div className="color-row__custom">
                        <label className="visually-hidden" htmlFor={`${uid}-colname-${i}`}>Colour name</label>
                        <input
                          id={`${uid}-colname-${i}`}
                          placeholder="Colour name"
                          value={col.customName ?? ''}
                          maxLength={LIMITS.materialField}
                          onChange={(e) => setColor(col.id, { customName: e.target.value || undefined })}
                        />
                        <label className="visually-hidden" htmlFor={`${uid}-colhex-${i}`}>Swatch</label>
                        <input
                          id={`${uid}-colhex-${i}`}
                          type="color"
                          value={isHexColor(col.customHex) ? col.customHex : '#c2643c'}
                          onChange={(e) => setColor(col.id, { customHex: e.target.value })}
                        />
                      </div>
                    )}
                    <label className="visually-hidden" htmlFor={`${uid}-colnote-${i}`}>Where is colour {i + 1} used?</label>
                    <input
                      id={`${uid}-colnote-${i}`}
                      placeholder="Where it's used, e.g. stripes every 4 rows"
                      value={col.note ?? ''}
                      maxLength={LIMITS.colorNote}
                      onChange={(e) => setColor(col.id, { note: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Remove colour ${i + 1}`}
                    onClick={() => setColors((list) => list.filter((c) => c.id !== col.id))}
                  >
                    <TrashIcon size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn btn--soft btn--sm" onClick={addColor}>
            <PlusIcon size={16} /> Add colour
          </button>
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-notes`}>Notes</label>
          <textarea
            id={`${uid}-notes`}
            rows={3}
            value={notes}
            maxLength={LIMITS.componentNotes}
            placeholder="Instructions or reminders, e.g. decrease every 8th round"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Sheet>
  );
}
