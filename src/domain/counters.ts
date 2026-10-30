import { now } from './ids';
import type { CounterField, Project, ProjectComponent } from './types';
import { clampCount } from './validation';

/**
 * Applies a counter change to one component and returns the updated project.
 * Counts are clamped to 0..MAX_COUNT. Counting up on a not-started component (or planned project)
 * marks it in progress, so the overview reflects that work has begun.
 */
export function setCount(
  project: Project,
  componentId: string,
  field: CounterField,
  value: number,
): Project {
  const target = project.components.find((c) => c.id === componentId);
  if (!target) return project;
  const next = clampCount(value);
  if (next === target[field]) return project;
  const countingUp = next > target[field];

  const components = project.components.map((c): ProjectComponent => {
    if (c.id !== componentId) return c;
    return {
      ...c,
      [field]: next,
      status: countingUp && c.status === 'not_started' ? 'in_progress' : c.status,
    };
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
  return setCount(project, componentId, field, target[field] + delta);
}

export function resetCount(project: Project, componentId: string, field: CounterField): Project {
  return setCount(project, componentId, field, 0);
}
