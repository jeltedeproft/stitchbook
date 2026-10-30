import { changeCount, resetCount, setCount } from '../domain/counters';
import { moveComponent, updateComponent } from '../domain/components';
import { componentProgress } from '../domain/progress';
import type { CounterField, Project, ProjectComponent } from '../domain/types';
import { useI18n } from '../i18n/I18nProvider';
import { toolLabel, unitLabel } from '../i18n/labels';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { ComponentStatusBadge, Swatch } from './bits';
import { Counter } from './Counter';
import { RowLog } from './RowNotes';
import { CheckIcon, DownIcon, EditIcon, UpIcon } from './icons';

interface Props {
  project: Project;
  component: ProjectComponent;
  index: number;
  highlighted: boolean;
  onEdit(): void;
}

export function ComponentCard({ project, component: c, index, highlighted, onEdit }: Props) {
  const { update } = useStore();
  const toast = useToast();
  const { t, tp } = useI18n();
  const total = project.components.length;
  const unit = unitLabel(t, c.countUnit, true);
  const stitchesLabel = t('unit.stitches');
  const progress = componentProgress(c);

  const reset = (field: CounterField, label: string) => {
    const previous = c[field];
    update(project.id, (p) => resetCount(p, c.id, field));
    toast({
      message: t('counter.resetDone', { name: c.name, lower: label.toLowerCase() }),
      actionLabel: t('common.undo'),
      onAction: () => update(project.id, (p) => setCount(p, c.id, field, previous)),
    });
  };

  const toggleComplete = () => {
    const status = c.status === 'complete' ? 'in_progress' : 'complete';
    update(project.id, (p) => updateComponent(p, c.id, { status }));
  };

  return (
    <article
      id={`component-${c.id}`}
      className={`part ${highlighted ? 'part--recent' : ''} ${c.status === 'complete' ? 'part--done' : ''}`}
      aria-labelledby={`component-${c.id}-name`}
    >
      <header className="part__head">
        <button
          type="button"
          className={`part__check ${c.status === 'complete' ? 'is-on' : ''}`}
          aria-pressed={c.status === 'complete'}
          aria-label={t('part.markComplete', { name: c.name })}
          onClick={toggleComplete}
        >
          <CheckIcon size={18} strokeWidth={2.4} />
        </button>
        <div className="part__title">
          <h3 id={`component-${c.id}-name`}>{c.name}</h3>
          <div className="part__meta">
            <ComponentStatusBadge status={c.status} />
            {highlighted && <span className="badge badge--recent">{t('part.lastWorked')}</span>}
          </div>
        </div>
        <div className="part__tools">
          <button
            type="button"
            className="icon-btn"
            aria-label={t('part.moveUp', { name: c.name })}
            disabled={index === 0}
            onClick={() => update(project.id, (p) => moveComponent(p, c.id, -1))}
          >
            <UpIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('part.moveDown', { name: c.name })}
            disabled={index === total - 1}
            onClick={() => update(project.id, (p) => moveComponent(p, c.id, 1))}
          >
            <DownIcon />
          </button>
          <button type="button" className="icon-btn" aria-label={t('common.edit', { name: c.name })} onClick={onEdit}>
            <EditIcon />
          </button>
        </div>
      </header>

      {(c.toolSize || c.colors.length > 0) && (
        <dl className="part__facts">
          {c.toolSize && (
            <div>
              <dt>{toolLabel(t, project.craft)}</dt>
              <dd>{c.toolSize}</dd>
            </div>
          )}
          {c.colors.length > 0 && (
            <div className="part__colors">
              <dt>{tp('part.colours', c.colors.length)}</dt>
              <dd>
                <ul>
                  {c.colors.map((col) => {
                    const m = col.materialId ? project.materials.find((x) => x.id === col.materialId) : undefined;
                    const name = m
                      ? m.colorName || m.name
                      : col.materialId
                        ? t('part.removedMaterial')
                        : col.customName || t('part.colourFallback');
                    return (
                      <li key={col.id}>
                        <Swatch color={m?.colorHex ?? col.customHex} />
                        <span>
                          <strong>{name}</strong>
                          {col.note && <span className="muted"> — {col.note}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}

      {c.notes && <p className="part__notes">{c.notes}</p>}

      {c.countersEnabled ? (
        <>
          <div className="part__counters">
            <Counter
              label={unit}
              value={c.rows}
              target={c.targetRows}
              onChange={(d) => update(project.id, (p) => changeCount(p, c.id, 'rows', d))}
              onSet={(v) => update(project.id, (p) => setCount(p, c.id, 'rows', v))}
              onReset={() => reset('rows', unit)}
            />
            <Counter
              label={stitchesLabel}
              value={c.stitches}
              onChange={(d) => update(project.id, (p) => changeCount(p, c.id, 'stitches', d))}
              onSet={(v) => update(project.id, (p) => setCount(p, c.id, 'stitches', v))}
              onReset={() => reset('stitches', stitchesLabel)}
            />
          </div>
          {c.targetRows ? (
            <div className="part__progress" aria-hidden="true">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          ) : null}
          <RowLog project={project} component={c} />
        </>
      ) : (
        <button
          type="button"
          className="link-btn part__enable"
          onClick={() => update(project.id, (p) => updateComponent(p, c.id, { countersEnabled: true }))}
        >
          {t('part.enableCounters')}
        </button>
      )}
    </article>
  );
}
