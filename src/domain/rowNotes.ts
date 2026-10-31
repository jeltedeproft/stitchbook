import { now } from './ids';
import type { Project, ProjectComponent, RowNote } from './types';
import { LIMITS, MAX_COUNT, clampCount } from './validation';

/** The row being worked: the counter holds rows finished, so the next one is on the needles. */
export function workingRow(c: ProjectComponent): number {
  return Math.min(MAX_COUNT, c.rows + 1);
}

/** Rows finished on each piece: one count, or two when a pair is worked at once. */
export function pieceRows(c: ProjectComponent): number[] {
  return c.pairRows === undefined ? [c.rows] : [c.rows, c.pairRows];
}

function pieceDone(c: ProjectComponent, rows: number): boolean {
  return !!c.targetRows && rows >= c.targetRows;
}

/** True once a target is set and reached (on both pieces of a pair). */
export function isFinished(c: ProjectComponent): boolean {
  return pieceRows(c).every((n) => pieceDone(c, n));
}

/** The highest row in play: the furthest working row of any unfinished piece. */
export function topRow(c: ProjectComponent): number {
  return Math.max(...pieceRows(c).map((n) => (pieceDone(c, n) ? n : Math.min(MAX_COUNT, n + 1))));
}

export function rowNote(c: ProjectComponent, row: number): string | undefined {
  return c.rowNotes?.find((n) => n.row === row)?.text;
}

/** Notes on rows after the highest working row, nearest first. */
export function upcomingNotes(c: ProjectComponent, limit = 2): RowNote[] {
  const from = topRow(c);
  return (c.rowNotes ?? []).filter((n) => n.row > from).slice(0, limit);
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
