import { now } from './ids';
import type { Project, ProjectComponent, RowNote } from './types';
import { LIMITS, MAX_COUNT, clampCount } from './validation';

/** The row being worked: the counter holds rows finished, so the next one is on the needles. */
export function workingRow(c: ProjectComponent): number {
  return Math.min(MAX_COUNT, c.rows + 1);
}

/** True once a target is set and reached. */
export function isFinished(c: ProjectComponent): boolean {
  return !!c.targetRows && c.rows >= c.targetRows;
}

export function rowNote(c: ProjectComponent, row: number): string | undefined {
  return c.rowNotes?.find((n) => n.row === row)?.text;
}

/** Notes on rows after the working row, nearest first. */
export function upcomingNotes(c: ProjectComponent, limit = 2): RowNote[] {
  const from = workingRow(c);
  return (c.rowNotes ?? []).filter((n) => n.row > from).slice(0, limit);
}

/** How many rows a full row list shows: up to the target, the last note, and the working row. */
export function rowSpan(c: ProjectComponent): number {
  const lastNote = c.rowNotes?.at(-1)?.row ?? 0;
  return Math.max(c.targetRows ?? 0, lastNote, workingRow(c));
}

/**
 * Sets the note for one row. Text is trimmed and capped; empty text removes the note.
 * Notes stay sorted by row with at most one per row.
 */
export function setRowNote(project: Project, componentId: string, row: number, text: string): Project {
  const target = project.components.find((c) => c.id === componentId);
  const r = clampCount(row);
  if (!target || r < 1) return project;
  const clean = text.trim().slice(0, LIMITS.rowNote);
  const others = (target.rowNotes ?? []).filter((n) => n.row !== r);
  if (!clean && others.length === (target.rowNotes ?? []).length) return project;
  if (clean && rowNote(target, r) === clean) return project;
  const rowNotes = clean ? [...others, { row: r, text: clean }].sort((a, b) => a.row - b.row) : others;
  return {
    ...project,
    components: project.components.map((c) =>
      c.id === componentId ? { ...c, rowNotes: rowNotes.length ? rowNotes : undefined } : c,
    ),
    updatedAt: now(),
  };
}
