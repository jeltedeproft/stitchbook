import { CRAFTS, COMPONENT_STATUSES, PROJECT_STATUSES, SWATCHES, countersByDefault } from './craft';
import { newId } from './ids';
import type {
  ColorAssignment,
  CountUnit,
  Material,
  Project,
  ProjectComponent,
  RowNote,
} from './types';

export const MAX_COUNT = 99_999;
export const LIMITS = {
  projectName: 80,
  componentName: 60,
  materialField: 80,
  projectNotes: 5000,
  componentNotes: 2000,
  materialNotes: 1000,
  colorNote: 200,
  toolSize: 40,
  rowNote: 500,
} as const;

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value);
}

export type NameIssue = 'required' | 'tooLong';
export type CountIssue = 'notWhole' | 'tooBig';

/** Returns what is wrong with a name (the UI turns this into text), or undefined when valid. */
export function validateName(value: string, max: number): NameIssue | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  if (trimmed.length > max) return 'tooLong';
  return undefined;
}

/** Parses user-typed counter input. Returns the number or what is wrong with it. */
export function parseCount(input: string): { value: number } | { error: CountIssue } {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return { error: 'notWhole' };
  const value = Number(trimmed);
  if (value > MAX_COUNT) return { error: 'tooBig' };
  return { value };
}

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_COUNT, Math.max(0, Math.trunc(value)));
}

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t ? t.slice(0, max) : undefined;
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeColor(raw: unknown): ColorAssignment {
  const c = obj(raw);
  return {
    id: str(c.id, 100) ?? newId(),
    materialId: str(c.materialId, 100),
    customName: str(c.customName, LIMITS.materialField),
    customHex: isHexColor(c.customHex) ? c.customHex : undefined,
    note: str(c.note, LIMITS.colorNote),
  };
}

function normalizeMaterial(raw: unknown): Material | undefined {
  const m = obj(raw);
  const name = str(m.name, LIMITS.materialField);
  if (!name) return undefined;
  return {
    id: str(m.id, 100) ?? newId(),
    name,
    brand: str(m.brand, LIMITS.materialField),
    fiber: str(m.fiber, LIMITS.materialField),
    colorName: str(m.colorName, LIMITS.materialField),
    colorHex: isHexColor(m.colorHex) ? m.colorHex : undefined,
    weight: str(m.weight, LIMITS.materialField),
    notes: str(m.notes, LIMITS.materialNotes),
  };
}

function normalizeRowNotes(raw: unknown): RowNote[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const byRow = new Map<number, string>();
  for (const item of raw) {
    const n = obj(item);
    const row = typeof n.row === 'number' ? clampCount(n.row) : 0;
    const text = str(n.text, LIMITS.rowNote);
    if (row > 0 && text) byRow.set(row, text);
  }
  if (byRow.size === 0) return undefined;
  return [...byRow].sort((a, b) => a[0] - b[0]).map(([row, text]) => ({ row, text }));
}

function normalizeComponent(raw: unknown, countersDefault: boolean): ProjectComponent | undefined {
  const c = obj(raw);
  const name = str(c.name, LIMITS.componentName);
  if (!name) return undefined;
  const target = typeof c.targetRows === 'number' ? clampCount(c.targetRows) : 0;
  return {
    id: str(c.id, 100) ?? newId(),
    name,
    status: pick(c.status, COMPONENT_STATUSES, 'not_started'),
    countUnit: pick<CountUnit>(c.countUnit, ['row', 'round'], 'row'),
    rows: clampCount(Number(c.rows ?? 0)),
    targetRows: target > 0 ? target : undefined,
    stitches: clampCount(Number(c.stitches ?? 0)),
    toolSize: str(c.toolSize, LIMITS.toolSize),
    colors: Array.isArray(c.colors) ? c.colors.map(normalizeColor) : [],
    notes: str(c.notes, LIMITS.componentNotes),
    rowNotes: normalizeRowNotes(c.rowNotes),
    countersEnabled: typeof c.countersEnabled === 'boolean' ? c.countersEnabled : countersDefault,
  };
}

/**
 * Turns untrusted data (an import file, an older stored record) into a valid Project,
 * or undefined when it has no id or usable name.
 */
export function normalizeProject(raw: unknown): Project | undefined {
  const p = obj(raw);
  const id = str(p.id, 100);
  const name = str(p.name, LIMITS.projectName);
  if (!id || !name) return undefined;
  const craft = pick(p.craft, CRAFTS, 'other');
  const counters = countersByDefault(craft);
  const created = typeof p.createdAt === 'number' ? p.createdAt : Date.now();
  const components = Array.isArray(p.components)
    ? p.components.map((c) => normalizeComponent(c, counters)).filter((c): c is ProjectComponent => !!c)
    : [];
  const photo = typeof p.photo === 'string' && p.photo.startsWith('data:image/') ? p.photo : undefined;
  const lastComponentId = str(p.lastComponentId, 100);
  return {
    id,
    name,
    craft,
    status: pick(p.status, PROJECT_STATUSES, 'planned'),
    notes: str(p.notes, LIMITS.projectNotes),
    photo,
    swatch: isHexColor(p.swatch) ? p.swatch : SWATCHES[0],
    archived: p.archived === true,
    isSample: p.isSample === true,
    materials: Array.isArray(p.materials)
      ? p.materials.map(normalizeMaterial).filter((m): m is Material => !!m)
      : [],
    components,
    lastComponentId: components.some((c) => c.id === lastComponentId) ? lastComponentId : undefined,
    createdAt: created,
    updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : created,
  };
}
