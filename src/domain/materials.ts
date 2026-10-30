import { newId, now } from './ids';
import type { Material, Project } from './types';
import { LIMITS, isHexColor, validateName } from './validation';
import { ValidationError } from './projects';

export type MaterialInput = Omit<Material, 'id'>;

function clean(input: MaterialInput): MaterialInput {
  const issue = validateName(input.name, LIMITS.materialField);
  if (issue) throw new ValidationError(`Material name: ${issue}`);
  const s = (v: string | undefined, max: number = LIMITS.materialField) => v?.trim().slice(0, max) || undefined;
  return {
    name: input.name.trim(),
    brand: s(input.brand),
    fiber: s(input.fiber),
    colorName: s(input.colorName),
    colorHex: isHexColor(input.colorHex) ? input.colorHex : undefined,
    weight: s(input.weight),
    notes: s(input.notes, LIMITS.materialNotes),
  };
}

export function addMaterial(project: Project, input: MaterialInput): Project {
  return {
    ...project,
    materials: [...project.materials, { ...clean(input), id: newId() }],
    updatedAt: now(),
  };
}

export function updateMaterial(project: Project, id: string, input: MaterialInput): Project {
  return {
    ...project,
    materials: project.materials.map((m) => (m.id === id ? { ...clean(input), id } : m)),
    updatedAt: now(),
  };
}

export function removeMaterial(
  project: Project,
  id: string,
): { project: Project; material: Material; index: number } | undefined {
  const index = project.materials.findIndex((m) => m.id === id);
  if (index < 0) return undefined;
  return {
    project: { ...project, materials: project.materials.filter((m) => m.id !== id), updatedAt: now() },
    material: project.materials[index],
    index,
  };
}

export function restoreMaterial(project: Project, material: Material, index: number): Project {
  if (project.materials.some((m) => m.id === material.id)) return project;
  const materials = [...project.materials];
  materials.splice(Math.min(index, materials.length), 0, material);
  return { ...project, materials, updatedAt: now() };
}

/** Human-readable one-liner, e.g. "Drops · Merino · Rust". */
export function materialSummary(m: Material): string {
  return [m.brand, m.fiber, m.colorName, m.weight].filter(Boolean).join(' · ');
}
