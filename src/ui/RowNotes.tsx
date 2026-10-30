import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { isFinished, rowNote, rowSpan, setRowNote, upcomingNotes, workingRow } from '../domain/rowNotes';
import type { Project, ProjectComponent } from '../domain/types';
import { LIMITS } from '../domain/validation';
import { useI18n } from '../i18n/I18nProvider';
import { unitLabel } from '../i18n/labels';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { CheckIcon } from './icons';
import { Sheet } from './Sheet';

const MORE_ROWS = 20;

function useUnits(c: ProjectComponent) {
  const { t } = useI18n();
  const unit = unitLabel(t, c.countUnit);
  const units = unitLabel(t, c.countUnit, true);
  return {
    units,
    unitLower: unit.toLowerCase(),
    unitsLower: units.toLowerCase(),
    rowName: (n: number) => t('rows.row', { unit, n }),
  };
}

/** Saving and removing row notes, with undo for removals. */
function useRowNoteActions(project: Project, c: ProjectComponent) {
  const { update } = useStore();
  const toast = useToast();
  const { t } = useI18n();
  const { unitLower } = useUnits(c);
  return (row: number, text: string) => {
    const previous = rowNote(c, row);
    update(project.id, (p) => setRowNote(p, c.id, row, text));
    if (previous && !text.trim()) {
      toast({
        message: t('rows.noteRemoved', { unit: unitLower, n: row }),
        actionLabel: t('common.undo'),
        onAction: () => update(project.id, (p) => setRowNote(p, c.id, row, previous)),
      });
    }
  };
}

/** On a part card: the row being worked with its note, the next noted rows, and a way into the full list. */
export function RowPeek({ project, component: c }: { project: Project; component: ProjectComponent }) {
  const { t, tp } = useI18n();
  const { unitLower, unitsLower, rowName } = useUnits(c);
  const [openAt, setOpenAt] = useState<number | 'list'>();
  const row = workingRow(c);
  const note = rowNote(c, row);
  const next = upcomingNotes(c);
  const finished = isFinished(c);
  const noteCount = c.rowNotes?.length ?? 0;

  return (
    <div className="rowpeek">
      {finished ? (
        <p className="rowpeek__finished">
          <CheckIcon size={16} strokeWidth={2.4} />{' '}
          {tp('rows.finished', c.targetRows!, { unit: unitLower, units: unitsLower })}
        </p>
      ) : (
        <div className={`rowpeek__now ${note ? 'has-note' : ''}`} key={row}>
          <span className="rowpeek__label">
            {t(project.craft === 'crochet' ? 'rows.nowHook' : 'rows.now')} · <strong>{rowName(row)}</strong>
          </span>
          {note && <p className="rowpeek__note">{note}</p>}
          <button type="button" className="link-btn" onClick={() => setOpenAt(row)}>
            {note ? t('rows.editNote') : t('rows.addNote', { unit: unitLower })}
          </button>
        </div>
      )}
      {next.length > 0 && (
        <div className="rowpeek__next">
          <span className="rowpeek__label">{t('rows.next')}</span>
          <ul>
            {next.map((n) => (
              <li key={n.row}>
                <button type="button" className="rowpeek__item" onClick={() => setOpenAt(n.row)}>
                  <strong>{rowName(n.row)}</strong> <span>{n.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="link-btn rowpeek__all" onClick={() => setOpenAt('list')}>
        {tp('rows.all', noteCount, { units: unitsLower })}
      </button>
      {openAt !== undefined && (
        <RowsSheet
          project={project}
          component={c}
          editRow={openAt === 'list' ? undefined : openAt}
          onClose={() => setOpenAt(undefined)}
        />
      )}
    </div>
  );
}

interface SheetProps {
  project: Project;
  component: ProjectComponent;
  editRow?: number;
  onClose(): void;
}

/** Every row of a part as its own item: done, on the needles, or still to come, each with a note. */
export function RowsSheet({ project, component: c, editRow, onClose }: SheetProps) {
  const { t } = useI18n();
  const { units, unitLower, rowName } = useUnits(c);
  const save = useRowNoteActions(project, c);
  const [editing, setEditing] = useState<number | undefined>(editRow);
  const current = workingRow(c);
  const [extra, setExtra] = useState(() => (c.targetRows ? 0 : MORE_ROWS));
  const span = Math.max(rowSpan(c), editRow ?? 0) + extra;
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const focus = editRow ?? current;
    list.current?.querySelector(`[data-row="${focus}"]`)?.scrollIntoView?.({ block: 'center' });
    // Only on open: later edits should not move the list.
  }, []);

  const rows = Array.from({ length: span }, (_, i) => i + 1);

  return (
    <Sheet title={t('rows.sheetTitle', { name: c.name, units })} onClose={onClose}>
      <p className="hint rows-hint">{t('rows.sheetHint', { unit: unitLower })}</p>
      <ol className="rowlist" ref={list}>
        {rows.map((n) => {
          const note = rowNote(c, n);
          const state = n < current || (n === current && isFinished(c)) ? 'done' : n === current ? 'now' : 'todo';
          return (
            <li key={n} data-row={n} className={`rowitem rowitem--${state} ${note ? 'has-note' : ''}`}>
              <span className="rowitem__num" aria-hidden="true">
                {state === 'done' ? <CheckIcon size={14} strokeWidth={2.6} /> : n}
              </span>
              {editing === n ? (
                <RowNoteForm
                  label={t('rows.noteFor', { unit: unitLower, n })}
                  initial={note ?? ''}
                  canRemove={!!note}
                  onCancel={() => setEditing(undefined)}
                  onSave={(text) => {
                    save(n, text);
                    setEditing(undefined);
                  }}
                />
              ) : (
                <button type="button" className="rowitem__btn" onClick={() => setEditing(n)}>
                  <span className="rowitem__title">
                    {rowName(n)}
                    {state === 'now' && <span className="rowitem__state rowitem__state--now">{t('rows.current')}</span>}
                    {state === 'done' && <span className="visually-hidden">{t('rows.done')}</span>}
                  </span>
                  {note ? <span className="rowitem__note">{note}</span> : <span className="rowitem__add">{t('rows.empty')}</span>}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn--ghost btn--sm rows-more" onClick={() => setExtra((x) => x + MORE_ROWS)}>
        {t('rows.showMore', { count: MORE_ROWS })}
      </button>
    </Sheet>
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
    <form className="rowitem__form" onSubmit={submit}>
      <label htmlFor={id} className="visually-hidden">{label}</label>
      <textarea
        id={id}
        rows={2}
        autoFocus
        value={text}
        maxLength={LIMITS.rowNote}
        placeholder={t('rows.notePlaceholder')}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onCancel();
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
          }
        }}
      />
      <div className="rowitem__actions">
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
