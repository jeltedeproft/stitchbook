import { countersByDefault } from './craft';
import { newId, now } from './ids';
import type { ColorAssignment, Project, ProjectComponent } from './types';
import { LIMITS, clampCount, validateName } from './validation';
import { ValidationError } from './projects';

export type ComponentPatch = Partial<Omit<ProjectComponent, 'id' | 'colors'>> & {
  colors?: ColorAssignment[];
};

function touch(project: Project, components: ProjectComponent[]): Project {
  return { ...project, components, updatedAt: now() };
}

export function addComponent(project: Project, name: string): Project {
  const issue = validateName(name, LIMITS.componentName);
  if (issue) throw new ValidationError(`Component name: ${issue}`);
  const component: ProjectComponent = {
    id: newId(),
    name: name.trim(),
    status: 'not_started',
    countUnit: 'row',
    rows: 0,
    stitches: 0,
    colors: [],
    countersEnabled: countersByDefault(project.craft),
  };
  return touch(project, [...project.components, component]);
}

export function updateComponent(project: Project, id: string, patch: ComponentPatch): Project {
  if (patch.name !== undefined) {
    const issue = validateName(patch.name, LIMITS.componentName);
    if (issue) throw new ValidationError(`Component name: ${issue}`);
  }
  const components = project.components.map((c) => {
    if (c.id !== id) return c;
    const next: ProjectComponent = { ...c, ...patch };
    if (patch.name !== undefined) next.name = patch.name.trim();
    if (patch.rows !== undefined) next.rows = clampCount(patch.rows);
    if (patch.stitches !== undefined) next.stitches = clampCount(patch.stitches);
    if ('targetRows' in patch) {
      const t = patch.targetRows === undefined ? 0 : clampCount(patch.targetRows);
      next.targetRows = t > 0 ? t : undefined;
    }
    if ('toolSize' in patch) next.toolSize = patch.toolSize?.trim().slice(0, LIMITS.toolSize) || undefined;
    if ('notes' in patch) next.notes = patch.notes?.trim().slice(0, LIMITS.componentNotes) || undefined;
    return next;
  });
  return touch(project, components);
}

export function renameComponent(project: Project, id: string, name: string): Project {
  return updateComponent(project, id, { name });
}

/** Moves a component one place up (-1) or down (+1). No-op at the ends. */
export function moveComponent(project: Project, id: string, direction: -1 | 1): Project {
  const index = project.components.findIndex((c) => c.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= project.components.length) return project;
  const components = [...project.components];
  [components[index], components[target]] = [components[target], components[index]];
  return touch(project, components);
}

export interface RemovedComponent {
  project: Project;
  component: ProjectComponent;
  index: number;
}

export function removeComponent(project: Project, id: string): RemovedComponent | undefined {
  const index = project.components.findIndex((c) => c.id === id);
  if (index < 0) return undefined;
  const component = project.components[index];
  const next = touch(
    project,
    project.components.filter((c) => c.id !== id),
  );
  if (next.lastComponentId === id) next.lastComponentId = undefined;
  return { project: next, component, index };
}

/** Puts a removed component back at its old position (used by undo). */
export function restoreComponent(project: Project, component: ProjectComponent, index: number): Project {
  if (project.components.some((c) => c.id === component.id)) return project;
  const components = [...project.components];
  components.splice(Math.min(index, components.length), 0, component);
  return touch(project, components);
}

export function addColor(project: Project, componentId: string, color: Omit<ColorAssignment, 'id'>): Project {
  const component = project.components.find((c) => c.id === componentId);
  if (!component) return project;
  const note = color.note?.trim().slice(0, LIMITS.colorNote) || undefined;
  return updateComponent(project, componentId, {
    colors: [...component.colors, { ...color, note, id: newId() }],
  });
}

export function updateColor(
  project: Project,
  componentId: string,
  colorId: string,
  patch: Partial<Omit<ColorAssignment, 'id'>>,
): Project {
  const component = project.components.find((c) => c.id === componentId);
  if (!component) return project;
  return updateComponent(project, componentId, {
    colors: component.colors.map((c) => (c.id === colorId ? { ...c, ...patch } : c)),
  });
}

export function removeColor(project: Project, componentId: string, colorId: string): Project {
  const component = project.components.find((c) => c.id === componentId);
  if (!component) return project;
  return updateComponent(project, componentId, {
    colors: component.colors.filter((c) => c.id !== colorId),
  });
}
