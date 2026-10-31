import { useId, useState, type FormEvent } from 'react';
import { COMPONENT_STATUSES } from '../domain/craft';
import { canonicalToolSize, formatToolSize, toolSizeOptions } from '../i18n/craftData';
import { useI18n } from '../i18n/I18nProvider';
import { componentStatusLabel, nameIssueText, toolLabel, unitLabel } from '../i18n/labels';
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
  const { t, lang, sizes } = useI18n();
  const [name, setName] = useState(component.name);
  const [status, setStatus] = useState<ComponentStatus>(component.status);
  const [countUnit, setCountUnit] = useState<CountUnit>(component.countUnit);
  const [target, setTarget] = useState(component.targetRows ? String(component.targetRows) : '');
  const [toolSize, setToolSize] = useState(() => canonicalToolSize(component.toolSize ?? '', project.craft));
  const toolOptions = toolSizeOptions(project.craft, lang, sizes);
  const [notes, setNotes] = useState(component.notes ?? '');
  const [paired, setPaired] = useState(component.pairRows !== undefined);
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
    const nameError = nameIssueText(t, validateName(name, LIMITS.componentName), 'project.partNameRequired', LIMITS.componentName);
    const tgt = target.trim();
    const targetError = tgt && !/^\d+$/.test(tgt) ? t('editor.targetError') : undefined;
    setErrors({ name: nameError, target: targetError });
    if (nameError || targetError) return;
    onSave({
      name,
      status,
      countUnit,
      targetRows: tgt ? Number(tgt) : undefined,
      toolSize,
      notes,
      // A new pair starts level with the first piece, the usual way to cast on two at once.
      pairRows: paired ? (component.pairRows ?? component.rows) : undefined,
      colors: colors.map((c) => ({ ...c, note: c.note?.trim() || undefined })),
    });
  };


  return (
    <Sheet
      title={t('editor.title', { name: component.name })}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--danger-ghost" onClick={onRemove}>
            <TrashIcon size={18} /> {t('common.remove')}
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" form={`${uid}-form`} className="btn btn--primary">
            {t('common.save')}
          </button>
        </>
      }
    >
      <form id={`${uid}-form`} className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={`${uid}-name`}>{t('common.name')}</label>
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
          <legend>{t('common.status')}</legend>
          <div className="segmented">
            {COMPONENT_STATUSES.map((s) => (
              <label key={s} className={status === s ? 'is-on' : ''}>
                <input type="radio" name={`${uid}-status`} value={s} checked={status === s} onChange={() => setStatus(s)} />
                {componentStatusLabel(t, s)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-tool`}>{toolLabel(t, project.craft)}</label>
          <select id={`${uid}-tool`} value={toolSize} onChange={(e) => setToolSize(e.target.value)}>
            <option value="">{t('editor.noSize')}</option>
            {/* keep a size typed in an older version, or one outside the list */}
            {toolSize && !toolOptions.some((o) => o.value === toolSize) && (
              <option value={toolSize}>{formatToolSize(toolSize, project.craft, lang, sizes)}</option>
            )}
            {toolOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <fieldset className="field">
          <legend>{t('editor.countIn')}</legend>
          {(['row', 'round'] as const).map((u) => (
            <label key={u} className="check">
              <input type="radio" name={`${uid}-unit`} value={u} checked={countUnit === u} onChange={() => setCountUnit(u)} />
              {unitLabel(t, u, true)}
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-target`}>{countUnit === 'round' ? t('editor.targetRounds') : t('editor.targetRows')}</label>
          <input
            id={`${uid}-target`}
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-invalid={!!errors.target}
            aria-describedby={errors.target ? `${uid}-target-err` : undefined}
          />
          {errors.target && <p className="field-error" id={`${uid}-target-err`}>{errors.target}</p>}
        </div>

        <label className="check">
          <input type="checkbox" checked={paired} onChange={(e) => setPaired(e.target.checked)} />
          {t('editor.pair')}
        </label>

        <fieldset className="field">
          <legend>{t('editor.colours')}</legend>
          {colors.length === 0 && <p className="hint">{t('editor.noColours')}</p>}
          <ul className="color-list">
            {colors.map((col, i) => {
              const linked = project.materials.find((m) => m.id === col.materialId);
              const isCustom = !col.materialId;
              return (
                <li key={col.id} className="color-row">
                  <Swatch color={linked?.colorHex ?? col.customHex} />
                  <div className="color-row__fields">
                    <label className="visually-hidden" htmlFor={`${uid}-col-${i}`}>{t('common.colourN', { n: i + 1 })}</label>
                    <select
                      id={`${uid}-col-${i}`}
                      value={col.materialId && linked ? col.materialId : col.materialId ? '' : CUSTOM}
                      onChange={(e) =>
                        e.target.value === CUSTOM
                          ? setColor(col.id, { materialId: undefined, customHex: col.customHex ?? '#c2643c' })
                          : setColor(col.id, { materialId: e.target.value })
                      }
                    >
                      {col.materialId && !linked && <option value="">{t('part.removedMaterial')}</option>}
                      {project.materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.colorName ? `${m.colorName} — ${m.name}` : m.name}
                        </option>
                      ))}
                      <option value={CUSTOM}>{t('editor.otherColour')}</option>
                    </select>
                    {isCustom && (
                      <div className="color-row__custom">
                        <label className="visually-hidden" htmlFor={`${uid}-colname-${i}`}>{t('editor.colourName')}</label>
                        <input
                          id={`${uid}-colname-${i}`}
                          placeholder={t('editor.colourName')}
                          value={col.customName ?? ''}
                          maxLength={LIMITS.materialField}
                          onChange={(e) => setColor(col.id, { customName: e.target.value || undefined })}
                        />
                        <label className="visually-hidden" htmlFor={`${uid}-colhex-${i}`}>{t('editor.swatch')}</label>
                        <input
                          id={`${uid}-colhex-${i}`}
                          type="color"
                          value={isHexColor(col.customHex) ? col.customHex : '#c2643c'}
                          onChange={(e) => setColor(col.id, { customHex: e.target.value })}
                        />
                      </div>
                    )}
                    <label className="visually-hidden" htmlFor={`${uid}-colnote-${i}`}>{t('editor.colourWhere', { n: i + 1 })}</label>
                    <input
                      id={`${uid}-colnote-${i}`}
                      placeholder={t('editor.colourWherePlaceholder')}
                      value={col.note ?? ''}
                      maxLength={LIMITS.colorNote}
                      onChange={(e) => setColor(col.id, { note: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t('editor.removeColour', { n: i + 1 })}
                    onClick={() => setColors((list) => list.filter((c) => c.id !== col.id))}
                  >
                    <TrashIcon size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn btn--soft btn--sm" onClick={addColor}>
            <PlusIcon size={16} /> {t('editor.addColour')}
          </button>
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-notes`}>{t('common.notes')}</label>
          <textarea
            id={`${uid}-notes`}
            rows={3}
            value={notes}
            maxLength={LIMITS.componentNotes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Sheet>
  );
}
