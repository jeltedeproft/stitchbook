import { useId, useState, type FormEvent } from 'react';
import {
  addMaterial,
  materialSummary,
  removeMaterial,
  restoreMaterial,
  updateMaterial,
  type MaterialInput,
} from '../domain/materials';
import type { Material, Project } from '../domain/types';
import { LIMITS, isHexColor, validateName } from '../domain/validation';
import { useI18n } from '../i18n/I18nProvider';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { Swatch } from './bits';
import { EditIcon, PlusIcon, TrashIcon } from './icons';
import { Sheet } from './Sheet';

export function MaterialsSection({ project }: { project: Project }) {
  const { update } = useStore();
  const toast = useToast();
  const { t } = useI18n();
  const [editing, setEditing] = useState<Material | 'new' | null>(null);
  const sewing = project.craft === 'sewing';
  const addLabel = t(sewing ? 'materials.addSewing' : 'materials.add');

  const remove = (m: Material) => {
    let removed: ReturnType<typeof removeMaterial> | undefined;
    update(project.id, (p) => {
      removed = removeMaterial(p, m.id);
      return removed?.project ?? p;
    });
    toast({
      message: t('materials.removed', { name: m.name }),
      actionLabel: t('common.undo'),
      onAction: () => removed && update(project.id, (p) => restoreMaterial(p, removed!.material, removed!.index)),
    });
  };

  return (
    <section className="section" aria-labelledby="materials-heading">
      <div className="section__head">
        <h2 id="materials-heading">{t(sewing ? 'materials.headingSewing' : 'materials.heading')}</h2>
        <button type="button" className="btn btn--soft btn--sm" aria-label={addLabel} onClick={() => setEditing('new')}>
          <PlusIcon size={16} /> {t('common.add')}
        </button>
      </div>

      {project.materials.length === 0 ? (
        <p className="muted section__empty">{t(sewing ? 'materials.emptySewing' : 'materials.empty')}</p>
      ) : (
        <ul className="materials">
          {project.materials.map((m) => (
            <li key={m.id} className="material">
              <Swatch color={m.colorHex} />
              <div className="material__text">
                <strong>{m.colorName ? `${m.name} · ${m.colorName}` : m.name}</strong>
                {materialSummary(m) && <span className="muted">{materialSummary(m)}</span>}
                {m.notes && <span className="material__notes">{m.notes}</span>}
              </div>
              <button type="button" className="icon-btn" aria-label={t('common.edit', { name: m.name })} onClick={() => setEditing(m)}>
                <EditIcon size={18} />
              </button>
              <button type="button" className="icon-btn" aria-label={t('materials.remove', { name: m.name })} onClick={() => remove(m)}>
                <TrashIcon size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <MaterialForm
          title={editing === 'new' ? addLabel : t('common.edit', { name: editing.name })}
          initial={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(input) => {
            update(project.id, (p) => (editing === 'new' ? addMaterial(p, input) : updateMaterial(p, editing.id, input)));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function MaterialForm({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  initial?: Material;
  onSave(input: MaterialInput): void;
  onClose(): void;
}) {
  const uid = useId();
  const { t } = useI18n();
  const [form, setForm] = useState<MaterialInput>({
    name: initial?.name ?? '',
    brand: initial?.brand ?? '',
    fiber: initial?.fiber ?? '',
    colorName: initial?.colorName ?? '',
    colorHex: initial?.colorHex,
    weight: initial?.weight ?? '',
    notes: initial?.notes ?? '',
  });
  const [error, setError] = useState<string>();
  const set = (key: keyof MaterialInput, value: string | undefined) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateName(form.name, LIMITS.materialField) ? t('materials.nameRequired') : undefined;
    setError(err);
    if (!err) onSave(form);
  };

  const text = (key: 'brand' | 'fiber' | 'colorName' | 'weight', label: string, placeholder: string) => (
    <div className="field">
      <label htmlFor={`${uid}-${key}`}>{label}</label>
      <input
        id={`${uid}-${key}`}
        value={form[key] ?? ''}
        maxLength={LIMITS.materialField}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" form={`${uid}-form`} className="btn btn--primary">{t('common.save')}</button>
        </>
      }
    >
      <form id={`${uid}-form`} className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={`${uid}-name`}>{t('common.name')}</label>
          <input
            id={`${uid}-name`}
            value={form.name}
            maxLength={LIMITS.materialField}
            placeholder={t('materials.namePlaceholder')}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${uid}-name-err` : `${uid}-name-hint`}
            data-autofocus
          />
          {error ? (
            <p className="field-error" id={`${uid}-name-err`}>{error}</p>
          ) : (
            <p className="hint" id={`${uid}-name-hint`}>{t('materials.nameHint')}</p>
          )}
        </div>
        <div className="grid-2">
          {text('brand', t('materials.brand'), t('materials.brandPlaceholder'))}
          {text('fiber', t('materials.fiber'), t('materials.fiberPlaceholder'))}
          {text('colorName', t('materials.colourName'), t('materials.colourNamePlaceholder'))}
          {text('weight', t('materials.weight'), t('materials.weightPlaceholder'))}
        </div>
        <div className="field">
          <span className="label" id={`${uid}-hex-label`}>{t('materials.swatch')}</span>
          <div className="swatch-input">
            <input
              type="color"
              aria-labelledby={`${uid}-hex-label`}
              value={isHexColor(form.colorHex) ? form.colorHex : '#c2643c'}
              onChange={(e) => set('colorHex', e.target.value)}
            />
            {form.colorHex ? (
              <button type="button" className="link-btn" onClick={() => set('colorHex', undefined)}>{t('materials.noSwatch')}</button>
            ) : (
              <span className="muted">{t('materials.noSwatchSet')}</span>
            )}
          </div>
        </div>
        <div className="field">
          <label htmlFor={`${uid}-notes`}>{t('common.notes')}</label>
          <textarea
            id={`${uid}-notes`}
            rows={2}
            value={form.notes ?? ''}
            maxLength={LIMITS.materialNotes}
            placeholder={t('materials.notesPlaceholder')}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </form>
    </Sheet>
  );
}
