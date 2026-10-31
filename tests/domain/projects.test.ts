import { describe, expect, it } from 'vitest';
import { updateComponent } from '../../src/domain/components';
import { addMaterial, materialSummary, removeMaterial, restoreMaterial, updateMaterial } from '../../src/domain/materials';
import { componentProgress, projectProgress } from '../../src/domain/progress';
import { createProject, setArchived, updateProject, ValidationError } from '../../src/domain/projects';
import { normalizeProject } from '../../src/domain/validation';
import { makeProject } from '../helpers';

describe('projects', () => {
  it('creates with defaults and trims the name', () => {
    const p = createProject({ name: '  Autumn socks ', craft: 'knitting' });
    expect(p).toMatchObject({ name: 'Autumn socks', status: 'planned', archived: false, isSample: false, components: [], materials: [] });
  });

  it('requires a name of at most 80 characters', () => {
    expect(() => createProject({ name: ' ', craft: 'crochet' })).toThrow(ValidationError);
    expect(() => createProject({ name: 'x'.repeat(81), craft: 'crochet' })).toThrow(ValidationError);
    expect(() => updateProject(makeProject(), { name: '' })).toThrow(ValidationError);
  });

  it('updates fields and archives', () => {
    const p = updateProject(makeProject(), { status: 'paused', notes: '  ', craft: 'crochet' });
    expect(p).toMatchObject({ status: 'paused', notes: undefined, craft: 'crochet' });
    expect(setArchived(p, true).archived).toBe(true);
  });

});

describe('progress', () => {
  it('uses targets, status and completion', () => {
    let p = makeProject('S', ['A', 'B']);
    const [a, b] = p.components;
    expect(projectProgress(p)).toBe(0);
    p = updateComponent(p, a.id, { targetRows: 100, rows: 50 });
    p = updateComponent(p, b.id, { status: 'complete' });
    expect(componentProgress(p.components[0])).toBe(0.5);
    expect(projectProgress(p)).toBe(0.75);
    expect(projectProgress({ ...p, status: 'completed' })).toBe(1);
  });
});

describe('materials', () => {
  it('needs only a name and drops empty optional fields', () => {
    const p = addMaterial(makeProject(), { name: 'Oat', brand: '  ', colorHex: 'not-a-colour' });
    expect(p.materials[0]).toMatchObject({ name: 'Oat', brand: undefined, colorHex: undefined });
    expect(() => addMaterial(p, { name: '' })).toThrow(ValidationError);
  });

  it('edits, removes and restores in place', () => {
    let p = addMaterial(addMaterial(makeProject(), { name: 'Oat' }), { name: 'Rust' });
    const [oat] = p.materials;
    p = updateMaterial(p, oat.id, { name: 'Oat', brand: 'Drops', fiber: 'Merino', colorName: 'Oatmeal' });
    expect(materialSummary(p.materials[0])).toBe('Drops · Merino · Oatmeal');
    const removed = removeMaterial(p, oat.id)!;
    expect(removed.project.materials.map((m) => m.name)).toEqual(['Rust']);
    expect(restoreMaterial(removed.project, removed.material, removed.index).materials.map((m) => m.name)).toEqual(['Oat', 'Rust']);
  });
});

describe('normalizeProject', () => {
  it('repairs untrusted data and rejects records without id or name', () => {
    expect(normalizeProject({ name: 'x' })).toBeUndefined();
    expect(normalizeProject({ id: '1', name: '  ' })).toBeUndefined();
    const p = normalizeProject({
      id: '1',
      name: 'Imported',
      craft: 'weaving',
      status: 'unknown',
      photo: 'javascript:alert(1)',
      components: [{ name: 'Body', rows: -5, stitches: 'many', lastComponentId: 'x' }, { name: '' }],
      materials: [{ name: 'Wool', colorHex: '#ABCDEF' }, {}],
    })!;
    expect(p).toMatchObject({ craft: 'other', status: 'planned', photo: undefined, archived: false });
    expect(p.components).toHaveLength(1);
    expect(p.components[0]).toMatchObject({ rows: 0, stitches: 0, status: 'not_started' });
    expect(p.materials).toHaveLength(1);
    expect(p.materials[0].colorHex).toBe('#ABCDEF');
  });
});
