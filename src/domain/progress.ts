import { pieceRows } from './rowNotes';
import type { Project, ProjectComponent } from './types';

export function componentProgress(c: ProjectComponent): number {
  if (c.status === 'complete') return 1;
  if (c.targetRows && c.targetRows > 0) {
    const pieces = pieceRows(c);
    const done = pieces.reduce((acc, n) => acc + Math.min(1, n / c.targetRows!), 0);
    return done / pieces.length;
  }
  return c.status === 'in_progress' ? 0.5 : 0;
}

export function projectProgress(p: Project): number {
  if (p.status === 'completed') return 1;
  if (p.components.length === 0) return 0;
  const sum = p.components.reduce((acc, c) => acc + componentProgress(c), 0);
  return sum / p.components.length;
}

export function partCounts(p: Project): { done: number; total: number } {
  return {
    done: p.components.filter((c) => c.status === 'complete').length,
    total: p.components.length,
  };
}
