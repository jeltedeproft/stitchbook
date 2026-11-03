import { now } from './ids';
import { topRow } from './rowNotes';
import type { CounterField, Project, ProjectComponent, RowNote } from './types';
import { clampCount } from './validation';

/**
 * Applies a counter change to one component and returns the updated project.
 * Counts are clamped to 0..MAX_COUNT. Counting up on a not-started component (or planned project)
 * marks it in progress, so the overview reflects that work has begun. Counting rows down un-works
 * them, so notes on rows the log no longer shows go too; notes planned beyond them stay.
 */
export function setCount(
  project: Project,
  componentId: string,
  field: CounterField,
  value: number,
): Project {
  const target = project.components.find((c) => c.id === componentId);
  if (!target) return project;
  const current = target[field] ?? 0;
  const next = clampCount(value);
  if (next === current) return project;
  const countingUp = next > current;

  const components = project.components.map((c): ProjectComponent => {
    if (c.id !== componentId) return c;
    const updated: ProjectComponent = {
      ...c,
      [field]: next,
      status: countingUp && c.status === 'not_started' ? 'in_progress' : c.status,
    };
    if (!countingUp && field !== 'stitches') {
      const rowNotes = keptNotes(c, updated);
      updated.rowNotes = rowNotes.length ? rowNotes : undefined;
    }
    return updated;
  });

  return {
    ...project,
    components,
    status: countingUp && project.status === 'planned' ? 'in_progress' : project.status,
    lastComponentId: componentId,
    updatedAt: now(),
  };
}

export function changeCount(
  project: Project,
  componentId: string,
  field: CounterField,
  delta: number,
): Project {
  const target = project.components.find((c) => c.id === componentId);
  if (!target) return project;
  return setCount(project, componentId, field, (target[field] ?? 0) + delta);
}

export function resetCount(project: Project, componentId: string, field: CounterField): Project {
  return setCount(project, componentId, field, 0);
}

/** Notes that survive counting down: drops those on rows the log showed before but no longer reaches. */
function keptNotes(before: ProjectComponent, after: ProjectComponent): RowNote[] {
  const from = topRow(after);
  const to = topRow(before);
  return (before.rowNotes ?? []).filter((n) => n.row <= from || n.row > to);
}
