import { SWATCHES } from './craft';
import { newId, now } from './ids';
import type { Craft, Project, ProjectStatus } from './types';
import { LIMITS, validateName } from './validation';

export interface ProjectInput {
  name: string;
  craft: Craft;
  status?: ProjectStatus;
  notes?: string;
  swatch?: string;
  photo?: string;
}

export class ValidationError extends Error {}

function cleanNotes(notes: string | undefined): string | undefined {
  const t = notes?.trim();
  return t ? t.slice(0, LIMITS.projectNotes) : undefined;
}

export function createProject(input: ProjectInput, existingCount = 0): Project {
  const issue = validateName(input.name, LIMITS.projectName);
  if (issue) throw new ValidationError(`Project name: ${issue}`);
  const t = now();
  return {
    id: newId(),
    name: input.name.trim(),
    craft: input.craft,
    status: input.status ?? 'planned',
    notes: cleanNotes(input.notes),
    photo: input.photo,
    swatch: input.swatch ?? SWATCHES[existingCount % SWATCHES.length],
    archived: false,
    isSample: false,
    materials: [],
    components: [],
    createdAt: t,
    updatedAt: t,
  };
}

export function updateProject(project: Project, patch: Partial<ProjectInput>): Project {
  if (patch.name !== undefined) {
    const issue = validateName(patch.name, LIMITS.projectName);
    if (issue) throw new ValidationError(`Project name: ${issue}`);
  }
  const next: Project = { ...project, updatedAt: now() };
  if (patch.name !== undefined) next.name = patch.name.trim();
  if (patch.craft !== undefined) next.craft = patch.craft;
  if (patch.status !== undefined) next.status = patch.status;
  if ('notes' in patch) next.notes = cleanNotes(patch.notes);
  if (patch.swatch !== undefined) next.swatch = patch.swatch;
  if ('photo' in patch) next.photo = patch.photo;
  return next;
}

export function setArchived(project: Project, archived: boolean): Project {
  return { ...project, archived, updatedAt: now() };
}

export function sortByRecent(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
}

