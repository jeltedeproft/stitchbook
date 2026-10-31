import { useId, useState, type FormEvent } from 'react';
import { isFinished, pieceRows, rowNote, setRowNote, topRow, upcomingNotes } from '../domain/rowNotes';
import type { Project, ProjectComponent } from '../domain/types';
import { LIMITS, MAX_COUNT, parseCount } from '../domain/validation';
import { formatNumber, useI18n } from '../i18n/I18nProvider';
import { unitLabel } from '../i18n/labels';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { CheckIcon, EditIcon } from './icons';

/** Rows shown before the log scrolls; "Show all" lifts the limit. */
const COMPACT_ROWS = 6;

type RowState = 'planned' | 'now' | 'done';
type SideState = 'done' | 'next' | 'todo';

const SIDES = ['pair.left', 'pair.right'] as const;
const SIDE_TEXT = { done: 'pair.sideDone', next: 'pair.sideNext', todo: 'pair.sideTodo' } as const;

/**
 * The part's rows as a running log, newest on top: notes planned for later rows, the row on the
 * needles, then every finished row. Counting up adds the next row above the ones already worked,
 * and any row can carry a note. When a pair is worked at once, each row shows how far the left and
 * right piece have got, and a row only counts as done once both have it.
 */
export function RowLog({ project, component: c }: { project: Project; component: ProjectComponent }) {
  const { t, tp, lang } = useI18n();
  const { update } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<number>();
  const [planning, setPlanning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const unit = unitLabel(t, c.countUnit);
  const unitLower = unit.toLowerCase();
  const title = t(c.countUnit === 'round' ? 'rows.logRound' : 'rows.log');
  const finished = isFinished(c);
  const pieces = pieceRows(c);
  const paired = pieces.length > 1;
  const top = topRow(c);

  const planned = finished ? [] : upcomingNotes(c, Infinity);
  const worked = Array.from({ length: top }, (_, i) => {
    const row = top - i;
    return { row, state: (pieces.every((n) => row <= n) ? 'done' : 'now') as RowState };
  });
  const sideState = (row: number, n: number): SideState =>
    row <= n ? 'done' : row === n + 1 && !(c.targetRows && n >= c.targetRows) ? 'next' : 'todo';
  const scrolls = worked.length > COMPACT_ROWS;

  const save = (row: number, text: string) => {
    const previous = rowNote(c, row);
    update(project.id, (p) => setRowNote(p, c.id, row, text));
    setEditing(undefined);
    if (previous && !text.trim()) {
      toast({
        message: t('rows.noteRemoved', { unit: unitLower, n: row }),
        actionLabel: t('common.undo'),
        onAction: () => update(project.id, (p) => setRowNote(p, c.id, row, previous)),
      });
    }
  };

  const renderRow = ({ row, state }: { row: number; state: RowState }) => {
    const note = rowNote(c, row);
    return (
      <li key={row} className={`logrow logrow--${state} ${note ? 'has-note' : ''}`}>
        <span className="logrow__num" aria-hidden="true">
          {state === 'done' ? <CheckIcon size={14} strokeWidth={2.6} /> : row}
        </span>
        {editing === row ? (
          <RowNoteForm
            label={t('rows.noteFor', { unit: unitLower, n: row })}
            initial={note ?? ''}
            canRemove={!!note}
            onCancel={() => setEditing(undefined)}
            onSave={(text) => save(row, text)}
          />
        ) : (
          <button type="button" className="logrow__btn" onClick={() => setEditing(row)}>
            <span className="logrow__name">
              {t('rows.row', { unit, n: row })}
              {paired && state !== 'planned'
                ? pieces.map((n, i) => {
                    const side = sideState(row, n);
                    const name = t(SIDES[i]);
                    return (
                      <span key={i} className={`logrow__side is-${side}`}>
                        <span aria-hidden="true">
                          {name}
                          {side === 'done' && <CheckIcon size={12} strokeWidth={3} />}
                        </span>
                        <span className="visually-hidden">{t(SIDE_TEXT[side], { side: name })}</span>
                      </span>
                    );
                  })
                : state === 'now' && (
                    <span className="logrow__tag">{t(project.craft === 'crochet' ? 'rows.nowHook' : 'rows.now')}</span>
                  )}
              {state === 'done' && !paired && <span className="visually-hidden">{t('rows.done')}</span>}
            </span>
            {note ? (
              <span className="logrow__note">{note}</span>
            ) : (
              <span className="logrow__add">
                <EditIcon size={14} /> {t('rows.addNote')}
              </span>
            )}
          </button>
        )}
      </li>
    );
  };

  return (
    <section className="rowlog" aria-label={title}>
      <div className="rowlog__head">
        <h4 className="rowlog__title">{title}</h4>
        {scrolls && (
          <button type="button" className="link-btn" aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}>
            {expanded ? t('rows.showLess') : t('rows.showAll', { count: formatNumber(lang, worked.length) })}
          </button>
        )}
      </div>

      {finished && (
        <p className="rowlog__finished">
          <CheckIcon size={16} strokeWidth={2.4} />
          {tp('rows.finished', c.targetRows!, { unit: unitLower, units: unitLabel(t, c.countUnit, true).toLowerCase() })}
        </p>
      )}

      {planned.length > 0 && (
        <ol className="rowlog__list rowlog__list--planned" aria-label={t('rows.planned')}>
          {planned.map((n) => renderRow({ row: n.row, state: 'planned' }))}
        </ol>
      )}

      <ol className={`rowlog__list ${scrolls && !expanded ? 'is-compact' : ''}`}>
        {worked.map(renderRow)}
      </ol>

      {planning ? (
        <PlanForm
          unitLower={unitLower}
          suggested={finished ? top : top + 1}
          onCancel={() => setPlanning(false)}
          onSave={(row, text) => {
            save(row, text);
            setPlanning(false);
          }}
        />
      ) : (
        <button type="button" className="link-btn rowlog__plan" onClick={() => setPlanning(true)}>
          {t('rows.planAhead', { unit: unitLower })}
        </button>
      )}
    </section>
  );
}

interface FormProps {
  label: string;
  initial: string;
  canRemove: boolean;
  onSave(text: string): void;
  onCancel(): void;
}

function RowNoteForm({ label, initial, canRemove, onSave, onCancel }: FormProps) {
  const { t } = useI18n();
  const id = useId();
  const [text, setText] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(text);
  };
  return (
    <form className="logrow__form" onSubmit={submit}>
      <label htmlFor={id} className="logrow__form-label">{label}</label>
      <NoteInput id={id} value={text} onChange={setText} onCancel={onCancel} onSubmit={() => onSave(text)} />
      <div className="logrow__actions">
        {canRemove && (
          <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => onSave('')}>
            {t('rows.removeNote')}
          </button>
        )}
        <span className="spacer" />
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
      </div>
    </form>
  );
}

interface PlanProps {
  unitLower: string;
  suggested: number;
  onSave(row: number, text: string): void;
  onCancel(): void;
}

/** Adds a note to a row that hasn't been reached yet, e.g. "round 40: start decreasing". */
function PlanForm({ unitLower, suggested, onSave, onCancel }: PlanProps) {
  const { t, lang } = useI18n();
  const id = useId();
  const [row, setRow] = useState(String(suggested));
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const submit = () => {
    const parsed = parseCount(row);
    if ('error' in parsed || parsed.value < 1) {
      setError(t('rows.planError', { unit: unitLower, max: formatNumber(lang, MAX_COUNT) }));
      return;
    }
    onSave(parsed.value, text);
  };
  return (
    <form
      className="logrow__form rowlog__planform"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="rowlog__planrow">
        <label htmlFor={`${id}-row`}>{t('rows.planRow', { unit: unitLower })}</label>
        <input
          id={`${id}-row`}
          inputMode="numeric"
          value={row}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => {
            setRow(e.target.value);
            setError(undefined);
          }}
        />
      </div>
      {error && <p className="field-error" id={`${id}-err`}>{error}</p>}
      <label htmlFor={`${id}-note`} className="visually-hidden">{t('rows.planNote')}</label>
      <NoteInput id={`${id}-note`} value={text} onChange={setText} onCancel={onCancel} onSubmit={submit} autoFocus={false} placeholder={t('rows.planNote')} />
      <div className="logrow__actions">
        <span className="spacer" />
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
      </div>
    </form>
  );
}

interface NoteInputProps {
  id: string;
  value: string;
  onChange(v: string): void;
  onSubmit(): void;
  onCancel(): void;
  autoFocus?: boolean;
  placeholder?: string;
}

/** Enter saves, Shift+Enter adds a line, Escape cancels without closing anything around it. */
function NoteInput({ id, value, onChange, onSubmit, onCancel, autoFocus = true, placeholder }: NoteInputProps) {
  return (
    <textarea
      id={id}
      rows={2}
      autoFocus={autoFocus}
      value={value}
      maxLength={LIMITS.rowNote}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSubmit();
        }
      }}
    />
  );
}
